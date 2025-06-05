// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";

/**
 * @title LPTokenStaker
 * @dev A contract for staking LP (Liquidity Provider) tokens to earn a specific reward token.
 * This contract is inspired by Synthetix's StakingRewards and Uniswap's MasterChef.
 * Users stake their LP tokens and earn rewards in a separate ERC20 token (e.g., EasyStakeToken).
 * Rewards can be claimed by users.
 * The owner can fund the contract with reward tokens and set reward distribution parameters.
 */
contract LPTokenStaker is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;
    using Math for uint256;

    /* ========== STATE VARIABLES ========== */

    IERC20 public immutable lpToken; // Address of the LP token contract (e.g., NERO-stNERO LP)
    IERC20 public immutable rewardToken; // Address of the reward token contract (e.g., EasyStakeToken)

    // Staking state
    mapping(address => uint256) public stakedBalance; // User -> amount of LP tokens staked
    uint256 public totalStaked; // Total amount of LP tokens staked in the contract

    // Reward state
    uint256 public rewardRate; // Rewards per second
    uint256 public rewardsDuration; // Duration for which the current reward rate is valid
    uint256 public periodFinish; // Timestamp when the current rewards distribution period ends
    uint256 public lastUpdateTime; // Last timestamp rewards were updated for all stakers

    uint256 public rewardPerTokenStored; // Accumulated rewards per staked token (scaled)
    mapping(address => uint256) public userRewardPerTokenPaid; // User -> rewardPerTokenStored for the last user action
    mapping(address => uint256) public rewards; // User -> accumulated but unclaimed rewards

    /* ========== EVENTS ========== */

    event Staked(address indexed user, uint256 amount);
    event Unstaked(address indexed user, uint256 amount);
    event RewardClaimed(address indexed user, uint256 amount);
    event RewardFunded(uint256 newRewardAmountAdded, uint256 totalEffectiveRewardForPeriod, uint256 newDuration);
    event RewardsDurationUpdated(uint256 newDuration);

    /* ========== ERRORS ========== */
    error InvalidAmount();
    error InvalidDuration();
    error InsufficientStakedBalance();
    error NothingToClaim();
    error RewardsNotFundedOrExpired();
    error NoNewRewardAndNoActivePeriod();
    // CallerNotOwner is handled by Ownable
    // TokenTransferFailed is handled by SafeERC20

    /* ========== CONSTRUCTOR ========== */

    /**
     * @param _lpToken The address of the LP token to be staked.
     * @param _rewardToken The address of the token to be distributed as rewards.
     * @param _initialOwner The initial owner of this staking contract.
     */
    constructor(address _lpToken, address _rewardToken, address _initialOwner) Ownable(_initialOwner) {
        require(_lpToken != address(0) && _rewardToken != address(0), "Zero address");
        lpToken = IERC20(_lpToken);
        rewardToken = IERC20(_rewardToken);
    }

    /* ========== MODIFIERS ========== */

    /**
     * @dev Modifier to update rewards for all users before a state-changing operation.
     */
    modifier updateReward(address account) {
        rewardPerTokenStored = rewardPerToken();
        lastUpdateTime = lastTimeRewardApplicable();
        if (account != address(0)) {
            rewards[account] = earned(account);
            userRewardPerTokenPaid[account] = rewardPerTokenStored;
        }
        _;
    }

    /* ========== VIEWS ========== */

    /**
     * @dev Returns the timestamp until which rewards are applicable.
     * If the current time is before periodFinish, it's block.timestamp.
     * Otherwise, it's periodFinish.
     */
    function lastTimeRewardApplicable() public view returns (uint256) {
        return Math.min(block.timestamp, periodFinish);
    }

    /**
     * @dev Calculates the current reward per token.
     * This value represents how many reward tokens have been accrued per unit of staked LP token
     * since the beginning or the last major update.
     * Scaled by 1e18 for precision.
     */
    function rewardPerToken() public view returns (uint256) {
        if (totalStaked == 0) {
            return rewardPerTokenStored;
        }
        return
            rewardPerTokenStored +
            (((lastTimeRewardApplicable() - lastUpdateTime) * rewardRate * (10**18)) / totalStaked);
    }

    /**
     * @dev Calculates the amount of rewards earned by a specific account.
     * @param account The account for which to calculate earned rewards.
     * @return The amount of rewards earned.
     */
    function earned(address account) public view returns (uint256) {
        return
            ((stakedBalance[account] * (rewardPerToken() - userRewardPerTokenPaid[account])) / (10**18)) +
            rewards[account];
    }

    /* ========== MUTATIVE FUNCTIONS ========== */

    /**
     * @notice Stakes LP tokens into the contract.
     * @param amount The amount of LP tokens to stake.
     */
    function stake(uint256 amount) external nonReentrant updateReward(msg.sender) {
        if (amount == 0) revert InvalidAmount();

        totalStaked += amount;
        stakedBalance[msg.sender] += amount;
        lpToken.safeTransferFrom(msg.sender, address(this), amount);

        emit Staked(msg.sender, amount);
    }

    /**
     * @notice Unstakes LP tokens from the contract.
     * @param amount The amount of LP tokens to unstake.
     * @dev This will also claim any pending rewards for the user.
     */
    function unstake(uint256 amount) external nonReentrant updateReward(msg.sender) {
        if (amount == 0) revert InvalidAmount();
        if (stakedBalance[msg.sender] < amount) revert InsufficientStakedBalance();

        // Claim rewards first (rewards[msg.sender] was updated by the `updateReward` modifier)
        uint256 reward = rewards[msg.sender];
        if (reward > 0) {
            rewards[msg.sender] = 0; // Reset before transfer
            rewardToken.safeTransfer(msg.sender, reward);
            emit RewardClaimed(msg.sender, reward);
        }
        
        totalStaked -= amount;
        stakedBalance[msg.sender] -= amount;
        lpToken.safeTransfer(msg.sender, amount);

        emit Unstaked(msg.sender, amount);
    }

    /**
     * @notice Claims accumulated rewards for the sender.
     */
    function claimReward() external nonReentrant updateReward(msg.sender) {
        uint256 reward = rewards[msg.sender]; // rewards[msg.sender] was updated by the `updateReward` modifier
        if (reward == 0) revert NothingToClaim();

        rewards[msg.sender] = 0; // Reset before transfer
        rewardToken.safeTransfer(msg.sender, reward);

        emit RewardClaimed(msg.sender, reward);
    }

    /* ========== RESTRICTED FUNCTIONS (OWNER) ========== */

    /**
     * @notice Called by the owner to allocate reward tokens already held by this contract for a new distribution period.
     * @param _rewardAmountToAdd The amount of reward tokens to add for this period.
     * @param _newDurationForRewards The duration (in seconds) over which the total available rewards
     * (allocated amount + any remaining from a previous period) will be distributed.
     * @dev This function pulls tokens from the owner via safeTransferFrom and updates related logic.
     */
    function notifyRewardAmount(uint256 _rewardAmountToAdd, uint256 _newDurationForRewards)
        external
        onlyOwner
        updateReward(address(0))
    {
        if (_newDurationForRewards == 0) revert InvalidDuration();

        uint256 remainingRewardsFromPreviousPeriod = 0;
        if (block.timestamp < periodFinish) {
            remainingRewardsFromPreviousPeriod = (periodFinish - block.timestamp) * rewardRate;
        }

        // If no new rewards are added, and no previous period was active or has finished, revert.
        if (_rewardAmountToAdd == 0 && remainingRewardsFromPreviousPeriod == 0) {
             revert NoNewRewardAndNoActivePeriod(); // Or simply InvalidAmount() if _rewardAmountToAdd must be > 0 for new periods
        }

        if (_rewardAmountToAdd > 0) {
            rewardToken.safeTransferFrom(msg.sender, address(this), _rewardAmountToAdd);
        }

        uint256 totalEffectiveRewardForPeriod = _rewardAmountToAdd + remainingRewardsFromPreviousPeriod;
        
        rewardsDuration = _newDurationForRewards;
        rewardRate = totalEffectiveRewardForPeriod / rewardsDuration;

        if (rewardRate == 0 && totalEffectiveRewardForPeriod > 0) {
            rewardRate = 1; // Distribute at least 1 wei per second if there are rewards.
        }

        lastUpdateTime = block.timestamp;
        periodFinish = block.timestamp + rewardsDuration;

        emit RewardFunded(_rewardAmountToAdd, totalEffectiveRewardForPeriod, rewardsDuration);
    }
    
    /**
     * @notice Allows the owner to update the duration of the rewards period.
     * @param _newDuration The new duration in seconds.
     * @dev This can be used to extend or shorten the current reward period.
     * The `rewardRate` will be recalculated based on the remaining rewards and the new duration.
     * No new rewards are added by this function; use `notifyRewardAmount` for that.
     */
    function setRewardsDuration(uint256 _newDuration) external onlyOwner {
        if (_newDuration == 0) revert InvalidDuration();
        if (block.timestamp >= periodFinish) revert RewardsNotFundedOrExpired(); // Cannot change duration if period is over or not started

        uint256 remainingRewards = (periodFinish - block.timestamp) * rewardRate;
        
        rewardRate = remainingRewards / _newDuration;
        rewardsDuration = _newDuration;
        periodFinish = block.timestamp + _newDuration;
        lastUpdateTime = block.timestamp; // Crucial: ensure reward calculations restart from this point with new rate

        emit RewardsDurationUpdated(_newDuration);
    }

    /**
     * @notice Allows the owner to rescue accidentally sent ERC20 tokens.
     * @param tokenAddress The address of the ERC20 token to rescue.
     * @param to The address to send the rescued tokens to.
     * @param amount The amount of tokens to rescue.
     * @dev This function cannot be used to rescue the `lpToken` or `rewardToken`
     *      that are actively managed by this contract.
     */
    function rescueERC20(address tokenAddress, address to, uint256 amount) external onlyOwner {
        require(tokenAddress != address(lpToken), "Cannot rescue LP token");
        require(tokenAddress != address(rewardToken), "Cannot rescue reward token");
        require(to != address(0), "Rescue to zero address");
        require(amount > 0, "Rescue zero amount");

        IERC20(tokenAddress).safeTransfer(to, amount);
    }
} 
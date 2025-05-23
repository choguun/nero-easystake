import React, { useState, useMemo } from 'react'
import { AiFillCaretLeft, AiFillCaretRight } from 'react-icons/ai'
import { TokenIcon, TokenSearchInput } from '@/components/features/token'
import { PaymasterModeValue, PaymasterToken, TokenListProps } from '@/types/Paymaster'
import { getCustomERC20Tokens, truncateAddress } from '@/utils'

const TokenList: React.FC<TokenListProps> = ({
  tokens,
  selectedToken,
  selectedPaymasterType,
  setSelectedPaymasterType,
  scrollContainerRef,
  onTokenClick,
  onScrollLeft,
  onScrollRight,
  onBackClick,
}) => {
  const [searchQuery, setSearchQuery] = useState('')

  const PAYMASTER_TYPE_OPTIONS = [
    { label: 'Pre-payment', value: 1 }, // PAYMASTER_MODE.PRE_FUND
    { label: 'Post-payment', value: 2 }, // PAYMASTER_MODE.POST_FUND
  ];

  const filteredTokens = useMemo(() => {
    if (!searchQuery.trim()) return tokens

    const query = searchQuery.toLowerCase().trim()

    return tokens.filter((token) => {
      const symbolMatch = token.symbol.toLowerCase().includes(query)
      let addressMatch = false
      if (query.startsWith('0x') && token.token) {
        addressMatch = token.token.toLowerCase().includes(query)
      }

      return symbolMatch || addressMatch
    })
  }, [tokens, searchQuery])

  const sortedTokens = useMemo(() => {
    const importedTokens = getCustomERC20Tokens()
    const importedAddresses = importedTokens.map((token) => token.contractAddress.toLowerCase())

    const nativeToken = filteredTokens.filter((token) => token.type === 'native')
    const importedGroup = filteredTokens.filter(
      (token) =>
        token.type !== 'native' &&
        token.token &&
        importedAddresses.includes(token.token.toLowerCase()),
    )
    const systemTokens = filteredTokens.filter(
      (token) =>
        token.type !== 'native' &&
        (!token.token || !importedAddresses.includes(token.token.toLowerCase())),
    )

    const sortByPrice = (firstToken: PaymasterToken, secondToken: PaymasterToken) => {
      const firstPrice = parseFloat(firstToken.price)
      const secondPrice = parseFloat(secondToken.price)
      return firstPrice - secondPrice
    }

    const sortedImportedGroup = [...importedGroup].sort(sortByPrice)
    const sortedOtherTokens = [...systemTokens].sort(sortByPrice)

    return [...nativeToken, ...sortedImportedGroup, ...sortedOtherTokens]
  }, [filteredTokens])

  if (tokens.length === 0) {
    return (
      <div className='p-3 text-center'>
        <p className='text-gray-500'>No tokens available</p>
        <button onClick={onBackClick} className='mt-2 text-sm text-blue-500 hover:text-blue-700'>
          Back
        </button>
      </div>
    )
  }

  return (
    <div className='w-full bg-white rounded-xl flex flex-col'>
      <div className='p-2 border-b flex items-center justify-between'>
        <button onClick={onBackClick} className='text-blue-500 hover:text-blue-600 mr-2 text-md'>
          ← Back
        </button>

        <TokenSearchInput
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          className='relative w-32 sm:w-40'
        />
      </div>

      {sortedTokens.length > 0 ? (
        <>
          <div className='flex items-center mt-3 w-full'>
            <AiFillCaretLeft
              className='text-2xl text-text-primary cursor-pointer'
              onClick={onScrollLeft}
            />
            <div className='flex space-x-2 overflow-x-auto no-scrollbar' ref={scrollContainerRef}>
              {sortedTokens.map((token) => (
                <div
                  key={token.token}
                  className={`flex items-center text-text-primary rounded-full p-2 border border-border-primary cursor-pointer min-w-[90px] ${
                    selectedToken === token.token ? 'bg-blue-200' : 'bg-white'
                  }`}
                  onClick={() => onTokenClick(token)}
                >
                  <TokenIcon
                    tokenAddress={token.token}
                    symbol={token.symbol}
                    size='sm'
                    isNative={token.type === 'native'}
                    className='mr-2'
                  />
                  <div className='flex flex-col overflow-hidden'>
                    <div className='text-xs font-bold'>{token.symbol}</div>
                    <div className='text-xs'>
                      {token.type === 'native' ? 'Native' : token.price}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <AiFillCaretRight
              className='text-2xl text-text-primary cursor-pointer'
              onClick={onScrollRight}
            />
          </div>
          <div className='flex flex-col text-sm p-1 mt-2'>
            <span>
              Selected Token:{' '}
              {selectedToken
                ? selectedToken === '0x0000000000000000000000000000000000000000'
                  ? 'NERO (Native)'
                  : truncateAddress(selectedToken)
                : 'None'}
            </span>
          </div>
          <div className="flex flex-col space-y-2 mt-3 p-2 border-t border-gray-200">
                <div className="text-xs text-gray-600 font-semibold text-center">Select Paymaster Mode:</div>
                <div className="flex space-x-3 justify-center">
                  {PAYMASTER_TYPE_OPTIONS.map(opt => (
                    <label key={opt.value} className="flex items-center space-x-1 cursor-pointer p-2 rounded-md hover:bg-gray-100 transition-colors">
                      <input
                        type="radio"
                        value={opt.value}
                        checked={selectedPaymasterType === opt.value}
                        onChange={() => setSelectedPaymasterType(opt.value as PaymasterModeValue)}
                        className="form-radio h-3 w-3 text-purple-600 focus:ring-purple-500"
                      />
                      <span className="text-xs text-gray-700">{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>
        </>
      ) : (
        <div className='p-4 text-center text-gray-500'>
          No tokens found matching "{searchQuery}"
        </div>
      )}
    </div>
  )
}

export default TokenList

"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import {
  Wallet,
  Zap,
  Shield,
  TrendingUp,
  Users,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Lightbulb,
} from "lucide-react";

export function StakingGuide() {
  return (
    <div className="space-y-6" data-oid="q4qf:9s">
      {/* Quick Start Guide */}
      <Card
        className="shadow-lg border-l-4 border-l-primary"
        data-oid="ixse4:."
      >
        <CardHeader data-oid="hxdna8_">
          <CardTitle
            className="flex items-center gap-2 text-xl"
            data-oid="05.lznf"
          >
            <Wallet className="h-6 w-6 text-primary" data-oid="507xd_y" />
            Quick Start Guide
          </CardTitle>
          <CardDescription data-oid="sdr5l8s">
            Get started with EasyStake in just a few simple steps
          </CardDescription>
        </CardHeader>
        <CardContent data-oid="8a.r7y8">
          <div
            className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
            data-oid="o72q47x"
          >
            <div className="text-center space-y-2" data-oid="lnt3sht">
              <div
                className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto font-bold text-lg"
                data-oid="athdt8a"
              >
                1
              </div>
              <h4 className="font-semibold" data-oid="vk20xp1">
                Connect Wallet
              </h4>
              <p className="text-sm text-muted-foreground" data-oid="te_8_v6">
                Connect your NERO-compatible wallet securely
              </p>
            </div>
            <div className="text-center space-y-2" data-oid="wc3m2lj">
              <div
                className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto font-bold text-lg"
                data-oid="7kbu3bn"
              >
                2
              </div>
              <h4 className="font-semibold" data-oid="33kxbdo">
                Enter Amount
              </h4>
              <p className="text-sm text-muted-foreground" data-oid="r0fl682">
                Choose how much NERO you want to stake
              </p>
            </div>
            <div className="text-center space-y-2" data-oid="tsvw513">
              <div
                className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto font-bold text-lg"
                data-oid="wy0:cdf"
              >
                3
              </div>
              <h4 className="font-semibold" data-oid="ij72wyx">
                Confirm & Stake
              </h4>
              <p className="text-sm text-muted-foreground" data-oid="yfyt7zz">
                Approve the transaction - gas fees sponsored!
              </p>
            </div>
            <div className="text-center space-y-2" data-oid="mhpi4gt">
              <div
                className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto font-bold text-lg"
                data-oid="najfigt"
              >
                4
              </div>
              <h4 className="font-semibold" data-oid="q9pfdfc">
                Earn Rewards
              </h4>
              <p className="text-sm text-muted-foreground" data-oid="xq8gxfj">
                Receive stNERO and start earning automatically
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comprehensive FAQ */}
      <Card className="shadow-lg" data-oid="zo1-uqz">
        <CardHeader data-oid=".f8mqs-">
          <CardTitle data-oid="zaaryen">Complete Guide to EasyStake</CardTitle>
          <CardDescription data-oid="owb.1e7">
            Everything you need to know about liquid staking with EasyStake
          </CardDescription>
        </CardHeader>
        <CardContent data-oid=":t.7mk7">
          <Accordion
            type="single"
            collapsible
            className="w-full"
            data-oid="p_21gdt"
          >
            <AccordionItem value="what-is-easystake" data-oid="bevk9fo">
              <AccordionTrigger className="text-left" data-oid="a13.9-.">
                What is EasyStake and how does it work?
              </AccordionTrigger>
              <AccordionContent className="space-y-3" data-oid="pn2q3e.">
                <p data-oid="-m4q2bx">
                  EasyStake is NERO's premier liquid staking protocol that
                  allows you to stake your NERO tokens while maintaining
                  liquidity. Here's how it works:
                </p>
                <ul className="list-disc pl-6 space-y-1" data-oid="p7e1g:e">
                  <li data-oid="j1:681t">
                    Deposit your NERO tokens into our secure Smart Vault
                  </li>
                  <li data-oid="z9sw0os">
                    Receive stNERO tokens (1:1 ratio initially) representing
                    your staked position
                  </li>
                  <li data-oid="p8s7-cd">
                    Your NERO is automatically staked across multiple validators
                    for optimal returns
                  </li>
                  <li data-oid="g3eb0hj">
                    Rewards are automatically compounded, increasing the value
                    of your stNERO
                  </li>
                  <li data-oid="lhb2o7k">
                    Use stNERO in other DeFi protocols while still earning
                    staking rewards
                  </li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="why-easystake" data-oid="he38-y5">
              <AccordionTrigger className="text-left" data-oid="l-z5-jn">
                Why choose EasyStake over traditional staking?
              </AccordionTrigger>
              <AccordionContent className="space-y-3" data-oid="pepc-5f">
                <div className="grid gap-4 md:grid-cols-2" data-oid="m10v7i2">
                  <div data-oid="r45imhg">
                    <h4
                      className="font-semibold text-green-600 mb-2 flex items-center gap-2"
                      data-oid="kwbllxz"
                    >
                      <CheckCircle className="h-4 w-4" data-oid="29lsipx" />
                      EasyStake Advantages
                    </h4>
                    <ul
                      className="list-disc pl-6 space-y-1 text-sm"
                      data-oid="bhbimg9"
                    >
                      <li data-oid="2hjjr8g">
                        <strong data-oid="zkx4ehn">Instant Liquidity:</strong>{" "}
                        No 21-day unbonding period
                      </li>
                      <li data-oid=":hzzm00">
                        <strong data-oid="ov3.fx5">
                          Gas-Free Transactions:
                        </strong>{" "}
                        Paymaster covers all fees
                      </li>
                      <li data-oid="c9ifscz">
                        <strong data-oid=".xglx1w">Auto-Compounding:</strong>{" "}
                        Rewards reinvested automatically
                      </li>
                      <li data-oid="0:t5sw9">
                        <strong data-oid="94bpb-4">DeFi Integration:</strong>{" "}
                        Use stNERO across protocols
                      </li>
                      <li data-oid="ctus9kg">
                        <strong data-oid="0rzey4a">AI Optimization:</strong>{" "}
                        Smart rebalancing for max yield
                      </li>
                      <li data-oid="1:jb5:9">
                        <strong data-oid="1:29c25">No Minimum:</strong> Stake
                        any amount of NERO
                      </li>
                      <li data-oid="w-qddui">
                        <strong data-oid="atkdfst">
                          Professional Management:
                        </strong>{" "}
                        Expert validator selection
                      </li>
                    </ul>
                  </div>
                  <div data-oid="a8.8:gz">
                    <h4
                      className="font-semibold text-red-600 mb-2 flex items-center gap-2"
                      data-oid="5sj:p0m"
                    >
                      <AlertTriangle className="h-4 w-4" data-oid="hy87dt0" />
                      Traditional Staking Limitations
                    </h4>
                    <ul
                      className="list-disc pl-6 space-y-1 text-sm"
                      data-oid="k:6oyif"
                    >
                      <li data-oid="6-skkhi">
                        21-day unbonding period to access funds
                      </li>
                      <li data-oid="_hu1v81">
                        Manual validator research and selection
                      </li>
                      <li data-oid="twqpm84">
                        Risk of slashing from bad validators
                      </li>
                      <li data-oid="982dm:u">
                        Manual reward claiming and compounding
                      </li>
                      <li data-oid="1yk5b7l">
                        High minimum staking requirements
                      </li>
                      <li data-oid="7e_b4d7">
                        Locked capital can't be used elsewhere
                      </li>
                      <li data-oid="m3.sxty">Gas fees for every transaction</li>
                    </ul>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="easystake-vs-others" data-oid=":c_j:za">
              <AccordionTrigger className="text-left" data-oid="_2c5484">
                How is EasyStake different from other NERO staking solutions?
              </AccordionTrigger>
              <AccordionContent className="space-y-3" data-oid="73oc5e3">
                <p data-oid="omknm68">
                  EasyStake is specifically designed as NERO's flagship liquid
                  staking solution with unique advantages:
                </p>
                <div
                  className="bg-secondary/50 p-4 rounded-lg space-y-3"
                  data-oid="jbv9.gj"
                >
                  <div data-oid="evyr9j8">
                    <h4
                      className="font-semibold text-primary flex items-center gap-2"
                      data-oid="mri7-g_"
                    >
                      <Zap className="h-4 w-4" data-oid="dzq1-_b" />
                      EasyStake (Liquid Staking)
                    </h4>
                    <p className="text-sm" data-oid="ivqbptu">
                      <strong data-oid="35tr3ze">Focus:</strong> Maximum capital
                      efficiency and user experience
                      <br data-oid="m.7y1uj" />
                      <strong data-oid="a5.n5wg">Target:</strong> DeFi users who
                      want yield + liquidity
                      <br data-oid="8e3i4iq" />
                      <strong data-oid="dtx96w7">Key Features:</strong> Instant
                      liquidity, gas sponsorship, AI optimization, DeFi
                      integration
                    </p>
                  </div>
                  <div data-oid="t7o6uau">
                    <h4
                      className="font-semibold text-muted-foreground flex items-center gap-2"
                      data-oid="-lwryi5"
                    >
                      <Users className="h-4 w-4" data-oid="rf337rf" />
                      Future NERO Governance Staking
                    </h4>
                    <p className="text-sm" data-oid="6rs82f2">
                      <strong data-oid="tyyupr2">Focus:</strong> Network
                      governance and voting rights
                      <br data-oid="e3qva7a" />
                      <strong data-oid="2_.kt.0">Target:</strong> Users who want
                      to participate in protocol governance
                      <br data-oid="_txiy4u" />
                      <strong data-oid="e59kxl3">Key Features:</strong> Voting
                      power, proposal creation, network parameter control
                    </p>
                  </div>
                  <div data-oid="ry:k2fc">
                    <h4
                      className="font-semibold text-muted-foreground flex items-center gap-2"
                      data-oid="2dyg:.e"
                    >
                      <RefreshCw className="h-4 w-4" data-oid="2d6rsdi" />
                      Future Validator Staking
                    </h4>
                    <p className="text-sm" data-oid="57f41bk">
                      <strong data-oid="45-oqy-">Focus:</strong> Running
                      validator nodes directly
                      <br data-oid="rbo9mty" />
                      <strong data-oid=".-or8y4">Target:</strong> Technical
                      users with infrastructure capabilities
                      <br data-oid="qef2:zk" />
                      <strong data-oid="qz9m9mj">Key Features:</strong> Direct
                      validator rewards, technical control, higher minimums
                    </p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground" data-oid="07jqpzf">
                  <strong data-oid="69wz:si">Bottom Line:</strong> EasyStake is
                  the "set it and forget it" solution for users who want maximum
                  yield with zero complexity.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="account-abstraction" data-oid="7tkdvus">
              <AccordionTrigger className="text-left" data-oid="uof2wr4">
                What is Account Abstraction and how does it benefit me?
              </AccordionTrigger>
              <AccordionContent className="space-y-3" data-oid="ginlyl6">
                <p data-oid="89fzvei">
                  Account Abstraction (AA) is a revolutionary wallet technology
                  that makes EasyStake incredibly user-friendly:
                </p>
                <div className="grid gap-4 md:grid-cols-2" data-oid="04j-xp1">
                  <div className="space-y-2" data-oid="xki4yma">
                    <h4
                      className="font-semibold flex items-center gap-2"
                      data-oid="-9gmd7u"
                    >
                      <span
                        className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs"
                        data-oid="vdzfo0v"
                      >
                        ✓
                      </span>
                      Gas Sponsorship
                    </h4>
                    <p
                      className="text-sm text-muted-foreground pl-8"
                      data-oid="24...e4"
                    >
                      Never worry about gas fees again. Our Paymaster
                      automatically covers all transaction costs for staking
                      operations.
                    </p>
                  </div>
                  <div className="space-y-2" data-oid="0wc25_d">
                    <h4
                      className="font-semibold flex items-center gap-2"
                      data-oid="vd7bcdm"
                    >
                      <span
                        className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs"
                        data-oid="w12nbm4"
                      >
                        ✓
                      </span>
                      Auto-Compounding
                    </h4>
                    <p
                      className="text-sm text-muted-foreground pl-8"
                      data-oid="eu46b9g"
                    >
                      Your rewards are automatically reinvested without any
                      manual intervention, maximizing your compound growth.
                    </p>
                  </div>
                  <div className="space-y-2" data-oid="ue5pkj2">
                    <h4
                      className="font-semibold flex items-center gap-2"
                      data-oid="yo58oqq"
                    >
                      <span
                        className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs"
                        data-oid="e7__zk:"
                      >
                        ✓
                      </span>
                      Social Recovery
                    </h4>
                    <p
                      className="text-sm text-muted-foreground pl-8"
                      data-oid="wei4_k5"
                    >
                      Recover your wallet using trusted contacts if you lose
                      access, providing an extra layer of security.
                    </p>
                  </div>
                  <div className="space-y-2" data-oid="uq91kgx">
                    <h4
                      className="font-semibold flex items-center gap-2"
                      data-oid="fgrpx-a"
                    >
                      <span
                        className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs"
                        data-oid="kld8h8k"
                      >
                        ✓
                      </span>
                      Batch Transactions
                    </h4>
                    <p
                      className="text-sm text-muted-foreground pl-8"
                      data-oid="lgb_1sj"
                    >
                      Execute multiple operations in a single transaction,
                      saving time and improving efficiency.
                    </p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="risks-security" data-oid="rvltt.o">
              <AccordionTrigger className="text-left" data-oid="2g815.i">
                What are the risks and security measures?
              </AccordionTrigger>
              <AccordionContent className="space-y-3" data-oid="teaahdp">
                <div className="space-y-4" data-oid="2gacb_y">
                  <div data-oid="y9:kcur">
                    <h4
                      className="font-semibold text-amber-600 mb-2 flex items-center gap-2"
                      data-oid="d4n3rk1"
                    >
                      <AlertTriangle className="h-4 w-4" data-oid="rlduqdj" />
                      Potential Risks
                    </h4>
                    <ul
                      className="list-disc pl-6 space-y-1 text-sm"
                      data-oid="t3:xh7w"
                    >
                      <li data-oid="ig:vpdw">
                        <strong data-oid="4a90qi_">Smart Contract Risk:</strong>{" "}
                        Bugs in smart contracts could affect funds
                      </li>
                      <li data-oid="p0_fgft">
                        <strong data-oid="5a4pafm">Validator Risk:</strong>{" "}
                        Slashing events could reduce staked amounts
                      </li>
                      <li data-oid="9gbdjr3">
                        <strong data-oid="8z1tic8">Liquidity Risk:</strong>{" "}
                        stNERO/NERO exchange rate may fluctuate
                      </li>
                      <li data-oid="byta4j8">
                        <strong data-oid="7cldtkj">Protocol Risk:</strong>{" "}
                        Changes to NERO staking parameters
                      </li>
                    </ul>
                  </div>
                  <div data-oid="s-sg::q">
                    <h4
                      className="font-semibold text-green-600 mb-2 flex items-center gap-2"
                      data-oid="dloav1o"
                    >
                      <Shield className="h-4 w-4" data-oid="jp389pw" />
                      Security Measures
                    </h4>
                    <ul
                      className="list-disc pl-6 space-y-1 text-sm"
                      data-oid="rgw6my2"
                    >
                      <li data-oid="y_qv.0t">
                        <strong data-oid="n3i-h2n">Audited Contracts:</strong>{" "}
                        Smart contracts undergo rigorous security audits
                      </li>
                      <li data-oid="jdc0p.p">
                        <strong data-oid="vn39js3">
                          Diversified Validators:
                        </strong>{" "}
                        Stake distributed across multiple validators
                      </li>
                      <li data-oid="hjmlni5">
                        <strong data-oid="cau8jyu">Insurance Fund:</strong>{" "}
                        Protocol maintains reserves for unexpected events
                      </li>
                      <li data-oid="gxh2uqy">
                        <strong data-oid="scwxacg">Gradual Rollout:</strong>{" "}
                        Features tested extensively before mainnet deployment
                      </li>
                      <li data-oid="p1-i4l2">
                        <strong data-oid="xvfubem">
                          Community Governance:
                        </strong>{" "}
                        Protocol upgrades require community approval
                      </li>
                    </ul>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="getting-started" data-oid="qi4i-ze">
              <AccordionTrigger className="text-left" data-oid="-oavk_d">
                How do I get started right now?
              </AccordionTrigger>
              <AccordionContent className="space-y-3" data-oid="t:729eb">
                <div
                  className="bg-primary/10 p-4 rounded-lg"
                  data-oid=".tjkx.v"
                >
                  <h4 className="font-semibold mb-3" data-oid="6-w2v15">
                    Ready to start earning? Follow these steps:
                  </h4>
                  <ol
                    className="list-decimal pl-6 space-y-2 text-sm"
                    data-oid="ejdis5b"
                  >
                    <li data-oid=".n8bc2s">
                      <strong data-oid="73e2eas">Connect Your Wallet:</strong>{" "}
                      Click the "Connect Wallet" button and select your
                      preferred wallet
                    </li>
                    <li data-oid="qqpczil">
                      <strong data-oid="5f-q9tx">Get NERO Tokens:</strong> Make
                      sure you have NERO tokens in your wallet (buy from
                      exchanges or bridge from other chains)
                    </li>
                    <li data-oid="mvobexb">
                      <strong data-oid="vvss:7s">Enter Stake Amount:</strong>{" "}
                      Use the input field to enter how much NERO you want to
                      stake
                    </li>
                    <li data-oid="o2zytdt">
                      <strong data-oid="g0t48yw">Review & Confirm:</strong>{" "}
                      Check the estimated stNERO you'll receive and confirm the
                      transaction
                    </li>
                    <li data-oid="l77kli0">
                      <strong data-oid="bu5vlcc">Start Earning:</strong> Your
                      stNERO will immediately start earning rewards through
                      auto-compounding
                    </li>
                  </ol>
                  <div
                    className="mt-4 p-3 bg-secondary/50 rounded border-l-4 border-l-accent"
                    data-oid="etjqinp"
                  >
                    <p
                      className="text-sm flex items-start gap-2"
                      data-oid="d:ukbvg"
                    >
                      <Lightbulb
                        className="h-4 w-4 text-accent mt-0.5 flex-shrink-0"
                        data-oid="uf6ymyx"
                      />

                      <span data-oid="7a_lhd0">
                        <strong data-oid="asqdzac">Pro Tip:</strong> Start with
                        a small amount to familiarize yourself with the process,
                        then stake more as you become comfortable with the
                        platform.
                      </span>
                    </p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}

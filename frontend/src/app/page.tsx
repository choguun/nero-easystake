import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  CheckCircle,
  BrainCircuit,
  TrendingUp,
  ArrowRight,
  Zap,
  UserCog,
  Fuel,
  RefreshCw,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import AiOptimizerForm from "@/components/ai-optimizer-form";
import { DashboardPreview } from "@/components/dashboard-preview";
import Link from "next/link";

export default function Home() {
  return (
    <div
      className="flex justify-center items-center flex-col min-h-dvh"
      data-oid="jw8.ptl"
    >
      <main className="flex-1" data-oid="kbqi153">
        {/* Hero Section */}
        <section
          className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-br from-secondary via-background to-background"
          data-oid="h5h2f2l"
        >
          <div className="container px-4 md:px-6" data-oid="nk98icw">
            <div
              className="grid gap-6 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2"
              data-oid=".dhn36z"
            >
              <div
                className="flex flex-col justify-center space-y-4 "
                data-oid="0hbkmd:"
              >
                <div className="space-y-2" data-oid="zzxgbh4">
                  <h1
                    className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none text-primary"
                    data-oid="ajy016j"
                  >
                    Unlock Effortless NERO Yield with EasyStake
                  </h1>
                  <p
                    className="max-w-[600px] text-muted-foreground md:text-xl"
                    data-oid="pqubolp"
                  >
                    Maximize your NERO capital efficiency through our Liquid
                    Staking Token (LST) solution, powered by AA Wallet, Smart
                    Vaults and AI-driven optimization.
                  </p>
                </div>
                <div
                  className="flex flex-col gap-2 min-[400px]:flex-row"
                  data-oid="mz2.1jd"
                >
                  <Link href="/stake" data-oid="_9dpxgw">
                    <Button
                      size="lg"
                      className="bg-primary hover:bg-primary/90 text-primary-foreground"
                      data-oid="4n_9b0h"
                    >
                      Get Started{" "}
                      <ArrowRight className="ml-2 h-5 w-5" data-oid="_eqk:.o" />
                    </Button>
                  </Link>
                  <Link href="/#account-abstraction" data-oid=".53af30">
                    <Button
                      size="lg"
                      variant="outline"
                      className="border-primary text-primary hover:bg-primary/10"
                      data-oid="jnd3i6p"
                    >
                      Learn More
                    </Button>
                  </Link>
                </div>
              </div>
              <Image
                src="https://picsum.photos/seed/defi-yield/600/400" // Changed seed for potentially more relevant image
                data-ai-hint="abstract defi liquid staking yield" // Updated hint
                width="600"
                height="400"
                alt="Hero - Abstract representation of DeFi liquid staking yield"
                className="mx-auto aspect-video overflow-hidden rounded-xl object-cover sm:w-full order-last md:order-first lg:aspect-square shadow-lg border border-border"
                data-oid="w25-dbu"
              />
            </div>
          </div>
        </section>

        {/* Account Abstraction Section */}
        <section
          id="account-abstraction"
          className="w-full py-12 md:py-24 lg:py-32 bg-secondary/50"
          data-oid="20ud_:n"
        >
          <div className="container px-4 md:px-6" data-oid="atqrxx9">
            <div
              className="flex flex-col items-center justify-center space-y-4 text-center mb-12"
              data-oid="rcolsp4"
            >
              <div
                className="inline-block rounded-lg bg-secondary px-3 py-1 text-sm text-primary"
                data-oid="x9oo6qi"
              >
                Next-Gen Wallets
              </div>
              <h2
                className="text-3xl font-bold tracking-tighter sm:text-5xl"
                data-oid="daf:pqn"
              >
                Seamless Experience with Account Abstraction
              </h2>
              <p
                className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed"
                data-oid="7zrpw__"
              >
                EasyStake utilizes Account Abstraction (AA) to simplify your
                staking journey and enhance security.
              </p>
            </div>
            <div
              className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:gap-12 lg:grid-cols-3"
              data-oid="nauf:_b"
            >
              <Card
                className="transition-shadow duration-300 hover:shadow-lg bg-background/70"
                data-oid="hiuefxf"
              >
                <CardHeader className="pb-4" data-oid="6qqsm5:">
                  <div className="flex items-center gap-4" data-oid="b2bku3g">
                    <Fuel className="h-8 w-8 text-accent" data-oid="2s998bc" />
                    <CardTitle className="text-lg" data-oid="3h1cqfy">
                      Gas Sponsorship
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent data-oid="k:957wq">
                  <CardDescription data-oid="f7gk2_l">
                    Forget about gas fees! Our Paymaster integration sponsors
                    transaction costs for a truly frictionless staking
                    experience.
                  </CardDescription>
                </CardContent>
              </Card>
              <Card
                className="transition-shadow duration-300 hover:shadow-lg bg-background/70"
                data-oid="5qbnqzm"
              >
                <CardHeader className="pb-4" data-oid="4lwilo:">
                  <div className="flex items-center gap-4" data-oid="efkywzy">
                    <RefreshCw
                      className="h-8 w-8 text-accent"
                      data-oid="5ujq71l"
                    />

                    <CardTitle className="text-lg" data-oid="sn5otqf">
                      Automated Compounding
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent data-oid="jt8q1-g">
                  <CardDescription data-oid="ame9fum">
                    Your AA Wallet automatically reinvests your staking rewards,
                    maximizing your yield effortlessly without manual
                    intervention.
                  </CardDescription>
                </CardContent>
              </Card>
              <Card
                className="transition-shadow duration-300 hover:shadow-lg bg-background/70"
                data-oid="rfgdvyk"
              >
                <CardHeader className="pb-4" data-oid="zedvw2i">
                  <div className="flex items-center gap-4" data-oid="s-xg1gn">
                    <Users className="h-8 w-8 text-accent" data-oid="_-weeqg" />
                    <CardTitle className="text-lg" data-oid="fnf1l3l">
                      Social Recovery
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent data-oid="viczb5z">
                  <CardDescription data-oid="jbf1qnu">
                    Enhance wallet security with social recovery options. Regain
                    access to your funds even if you lose your primary key,
                    using trusted contacts.
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section
          id="features"
          className="w-full py-12 md:py-24 lg:py-32 bg-background"
          data-oid="j6t34t3"
        >
          <div className="container px-4 md:px-6" data-oid="buro5k-">
            <div
              className="flex flex-col items-center justify-center space-y-4 text-center mb-12"
              data-oid="e-0l1eu"
            >
              <div
                className="inline-block rounded-lg bg-secondary px-3 py-1 text-sm text-primary"
                data-oid="a474.pi"
              >
                Key Features
              </div>
              <h2
                className="text-3xl font-bold tracking-tighter sm:text-5xl"
                data-oid="uvd70p5"
              >
                Optimize Your Staking Effortlessly
              </h2>
              <p
                className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed"
                data-oid="hwr5rro"
              >
                EasyStake provides powerful tools to automate and enhance your
                NERO LST staking rewards.
              </p>
            </div>
            <div
              className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:gap-12 lg:grid-cols-2"
              data-oid="1g27j4t"
            >
              <Card
                className="transition-shadow duration-300 hover:shadow-lg"
                data-oid="ls6:b0_"
              >
                <CardHeader className="pb-4" data-oid="tq1_72c">
                  <div className="flex items-center gap-4" data-oid="yfsffwf">
                    <Zap className="h-8 w-8 text-accent" data-oid="lmegxv9" />
                    <CardTitle className="text-xl" data-oid="9obthsu">
                      Smart Vault
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent data-oid="_0j1jk5">
                  <CardDescription data-oid="sfrbr.i">
                    Deposit your NERO LSTs into our Smart Vault and let our
                    automated system handle the complexities. It continuously
                    monitors the network and rebalances your stake to maximize
                    yield and minimize risk, ensuring optimal capital
                    efficiency.
                  </CardDescription>
                </CardContent>
              </Card>
              <Card
                className="transition-shadow duration-300 hover:shadow-lg"
                data-oid="tw:3o.s"
              >
                <CardHeader className="pb-4" data-oid="m5mhgy7">
                  <div className="flex items-center gap-4" data-oid="1axpykf">
                    <BrainCircuit
                      className="h-8 w-8 text-accent"
                      data-oid="lr-0drw"
                    />

                    <CardTitle className="text-xl" data-oid="0yk6fbn">
                      AI Strategy Optimizer
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent data-oid="_l8cv86">
                  <CardDescription data-oid="5vxbuz:">
                    Leverage the power of AI to get personalized staking
                    strategy recommendations. Based on real-time network
                    conditions and your defined risk tolerance, our AI suggests
                    the best approaches to optimize your returns.
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* AI Optimizer Interaction Section */}
        {/* <section id="ai-optimizer" className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-secondary/30 to-background">
                   <div className="container px-4 md:px-6">
                      <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
                        <div className="inline-block rounded-lg bg-secondary px-3 py-1 text-sm text-primary">AI Power</div>
                       <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Get Your AI-Powered Strategy</h2>
                       <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                         Select your risk profile and let our AI craft the optimal NERO LST staking strategy for you right now.
                       </p>
                     </div>
                     <div className="mx-auto w-full max-w-2xl">
                         <AiOptimizerForm />
                      </div>
                   </div>
                  </section> */}

        {/* Dashboard Preview Section */}
        <section
          id="dashboard"
          className="w-full py-12 md:py-24 lg:py-32 bg-background"
          data-oid="1ekq2b0"
        >
          <div
            className="container grid items-center gap-6 px-4 md:px-6 lg:grid-cols-2 lg:gap-10"
            data-oid="wt0xsmi"
          >
            <div className="space-y-4" data-oid="slrsh.p">
              <div
                className="inline-block rounded-lg bg-secondary px-3 py-1 text-sm text-primary"
                data-oid="ct7feoc"
              >
                Your Control Center
              </div>
              <h2
                className="text-3xl font-bold tracking-tighter md:text-4xl/tight"
                data-oid="no8ivfm"
              >
                Performance Dashboard
              </h2>
              <p
                className="max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed"
                data-oid="6z18ygn"
              >
                Monitor your staking rewards, track vault performance, and view
                AI-driven strategy recommendations all in one intuitive
                interface. Stay informed and in control of your assets.
              </p>
              <ul className="grid gap-2 py-4" data-oid="by2a0et">
                <li className="flex items-center" data-oid="xqf9h-3">
                  <CheckCircle
                    className="mr-2 inline-block h-4 w-4 text-accent"
                    data-oid="go5mj9u"
                  />
                  Real-time reward tracking
                </li>
                <li className="flex items-center" data-oid="por1eia">
                  <CheckCircle
                    className="mr-2 inline-block h-4 w-4 text-accent"
                    data-oid="oegr835"
                  />
                  Historical performance data
                </li>
                <li className="flex items-center" data-oid="kevumh.">
                  <CheckCircle
                    className="mr-2 inline-block h-4 w-4 text-accent"
                    data-oid="xa.wxze"
                  />
                  Clear visualization of AI suggestions
                </li>
              </ul>
              {/* <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                          View Demo <TrendingUp className="ml-2 h-5 w-5" />
                        </Button> */}
            </div>
            <div className="flex justify-center" data-oid="6:9-60x">
              <DashboardPreview data-oid="3q_q6oq" />
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section
          id="how-it-works"
          className="w-full py-12 md:py-24 lg:py-32 bg-secondary/50"
          data-oid="xb00ra9"
        >
          <div className="container px-4 md:px-6" data-oid="5q02dcv">
            <div
              className="flex flex-col items-center justify-center space-y-4 text-center mb-12"
              data-oid="55lypj1"
            >
              <div
                className="inline-block rounded-lg bg-secondary px-3 py-1 text-sm text-primary"
                data-oid="gf1zev9"
              >
                Simple Steps
              </div>
              <h2
                className="text-3xl font-bold tracking-tighter sm:text-5xl"
                data-oid="2sa5y9a"
              >
                How EasyStake Works
              </h2>
              <p
                className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed"
                data-oid="3br-mbj"
              >
                Getting started with EasyStake is straightforward. Follow these
                simple steps to maximize your NERO yield.
              </p>
            </div>
            <div
              className="mx-auto grid gap-8 sm:max-w-4xl sm:grid-cols-1 md:gap-12 lg:max-w-5xl lg:grid-cols-3"
              data-oid=":w5tqee"
            >
              <div className="grid gap-1 text-center" data-oid="h0:f-df">
                <div
                  className="flex justify-center items-center mb-4"
                  data-oid="e:g19bh"
                >
                  <div
                    className="flex items-center justify-center rounded-full bg-primary text-primary-foreground h-12 w-12 text-xl font-bold"
                    data-oid="wc3sv49"
                  >
                    1
                  </div>
                </div>
                <h3 className="text-lg font-bold" data-oid="jih9gwo">
                  Connect Wallet
                </h3>
                <p className="text-sm text-muted-foreground" data-oid="adu70j4">
                  Securely connect your NERO chain compatible wallet to the
                  EasyStake platform.
                </p>
              </div>
              <div className="grid gap-1 text-center" data-oid="gwkkp8v">
                <div
                  className="flex justify-center items-center mb-4"
                  data-oid="2e7z7zv"
                >
                  <div
                    className="flex items-center justify-center rounded-full bg-primary text-primary-foreground h-12 w-12 text-xl font-bold"
                    data-oid="iuw0e9s"
                  >
                    2
                  </div>
                </div>
                <h3 className="text-lg font-bold" data-oid="bvei.7h">
                  Deposit LSTs
                </h3>
                <p className="text-sm text-muted-foreground" data-oid="6f9itxc">
                  Deposit your NERO Liquid Staking Tokens (LSTs) into our secure
                  Smart Vault.
                </p>
              </div>
              <div className="grid gap-1 text-center" data-oid="olqo8ly">
                <div
                  className="flex justify-center items-center mb-4"
                  data-oid="xyg9-tn"
                >
                  <div
                    className="flex items-center justify-center rounded-full bg-primary text-primary-foreground h-12 w-12 text-xl font-bold"
                    data-oid="--cd824"
                  >
                    3
                  </div>
                </div>
                <h3 className="text-lg font-bold" data-oid="i:75xqk">
                  Earn & Optimize
                </h3>
                <p className="text-sm text-muted-foreground" data-oid="f8mcczi">
                  Watch your rewards grow as the Smart Vault and AI optimize
                  your staking strategy automatically.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

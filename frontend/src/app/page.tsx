import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, BrainCircuit, TrendingUp, ArrowRight, Zap, UserCog, Fuel, RefreshCw, Users } from 'lucide-react';
import AiOptimizerForm from '@/components/ai-optimizer-form';
import { DashboardPreview } from '@/components/dashboard-preview';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex justify-center items-center flex-col min-h-dvh">
      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-br from-secondary via-background to-background">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2">
              <div className="flex flex-col justify-center space-y-4 ">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none text-primary">
                    Unlock Effortless NERO Yield with EasyStake
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Maximize your NERO capital efficiency through our Liquid Staking Token (LST) solution, powered by AA Wallet, Smart Vaults and AI-driven optimization.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link href="/stake">
                    <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                      Get Started <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                  <Link
                    href="/#account-abstraction"
                  >
                    <Button size="lg" variant="outline" className="border-primary text-primary hover:bg-primary/10">
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
              />
            </div>
          </div>
        </section>

        {/* Account Abstraction Section */}
        <section id="account-abstraction" className="w-full py-12 md:py-24 lg:py-32 bg-secondary/50">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
              <div className="inline-block rounded-lg bg-secondary px-3 py-1 text-sm text-primary">Next-Gen Wallets</div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Seamless Experience with Account Abstraction</h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                EasyStake utilizes Account Abstraction (AA) to simplify your staking journey and enhance security.
              </p>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:gap-12 lg:grid-cols-3">
              <Card className="transition-shadow duration-300 hover:shadow-lg bg-background/70">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-4">
                    <Fuel className="h-8 w-8 text-accent" />
                    <CardTitle className="text-lg">Gas Sponsorship</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Forget about gas fees! Our Paymaster integration sponsors transaction costs for a truly frictionless staking experience.
                  </CardDescription>
                </CardContent>
              </Card>
              <Card className="transition-shadow duration-300 hover:shadow-lg bg-background/70">
                <CardHeader className="pb-4">
                   <div className="flex items-center gap-4">
                    <RefreshCw className="h-8 w-8 text-accent" />
                    <CardTitle className="text-lg">Automated Compounding</CardTitle>
                   </div>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Your AA Wallet automatically reinvests your staking rewards, maximizing your yield effortlessly without manual intervention.
                  </CardDescription>
                </CardContent>
              </Card>
              <Card className="transition-shadow duration-300 hover:shadow-lg bg-background/70">
                <CardHeader className="pb-4">
                   <div className="flex items-center gap-4">
                    <Users className="h-8 w-8 text-accent" />
                    <CardTitle className="text-lg">Social Recovery</CardTitle>
                   </div>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Enhance wallet security with social recovery options. Regain access to your funds even if you lose your primary key, using trusted contacts.
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

                {/* Features Section */}
                <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-background">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
              <div className="inline-block rounded-lg bg-secondary px-3 py-1 text-sm text-primary">Key Features</div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Optimize Your Staking Effortlessly</h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                EasyStake provides powerful tools to automate and enhance your NERO LST staking rewards.
              </p>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:gap-12 lg:grid-cols-2">
              <Card className="transition-shadow duration-300 hover:shadow-lg">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-4">
                     <Zap className="h-8 w-8 text-accent" />
                    <CardTitle className="text-xl">Smart Vault</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Deposit your NERO LSTs into our Smart Vault and let our automated system handle the complexities. It continuously monitors the network and rebalances your stake to maximize yield and minimize risk, ensuring optimal capital efficiency.
                  </CardDescription>
                </CardContent>
              </Card>
              <Card className="transition-shadow duration-300 hover:shadow-lg">
                <CardHeader className="pb-4">
                   <div className="flex items-center gap-4">
                    <BrainCircuit className="h-8 w-8 text-accent" />
                    <CardTitle className="text-xl">AI Strategy Optimizer</CardTitle>
                   </div>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Leverage the power of AI to get personalized staking strategy recommendations. Based on real-time network conditions and your defined risk tolerance, our AI suggests the best approaches to optimize your returns.
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
        <section id="dashboard" className="w-full py-12 md:py-24 lg:py-32 bg-background">
          <div className="container grid items-center gap-6 px-4 md:px-6 lg:grid-cols-2 lg:gap-10">
            <div className="space-y-4">
               <div className="inline-block rounded-lg bg-secondary px-3 py-1 text-sm text-primary">Your Control Center</div>
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">Performance Dashboard</h2>
              <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Monitor your staking rewards, track vault performance, and view AI-driven strategy recommendations all in one intuitive interface. Stay informed and in control of your assets.
              </p>
               <ul className="grid gap-2 py-4">
                <li className="flex items-center">
                  <CheckCircle className="mr-2 inline-block h-4 w-4 text-accent" />
                  Real-time reward tracking
                </li>
                <li className="flex items-center">
                  <CheckCircle className="mr-2 inline-block h-4 w-4 text-accent" />
                  Historical performance data
                </li>
                <li className="flex items-center">
                  <CheckCircle className="mr-2 inline-block h-4 w-4 text-accent" />
                  Clear visualization of AI suggestions
                </li>
              </ul>
                 {/* <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                    View Demo <TrendingUp className="ml-2 h-5 w-5" />
                  </Button> */}
            </div>
             <div className="flex justify-center">
                <DashboardPreview />
            </div>
          </div>
        </section>


        {/* How It Works Section */}
        <section id="how-it-works" className="w-full py-12 md:py-24 lg:py-32 bg-secondary/50">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
              <div className="inline-block rounded-lg bg-secondary px-3 py-1 text-sm text-primary">Simple Steps</div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">How EasyStake Works</h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Getting started with EasyStake is straightforward. Follow these simple steps to maximize your NERO yield.
              </p>
            </div>
            <div className="mx-auto grid gap-8 sm:max-w-4xl sm:grid-cols-1 md:gap-12 lg:max-w-5xl lg:grid-cols-3">
              <div className="grid gap-1 text-center">
                 <div className="flex justify-center items-center mb-4">
                   <div className="flex items-center justify-center rounded-full bg-primary text-primary-foreground h-12 w-12 text-xl font-bold">1</div>
                 </div>
                <h3 className="text-lg font-bold">Connect Wallet</h3>
                <p className="text-sm text-muted-foreground">Securely connect your NERO chain compatible wallet to the EasyStake platform.</p>
              </div>
              <div className="grid gap-1 text-center">
                 <div className="flex justify-center items-center mb-4">
                   <div className="flex items-center justify-center rounded-full bg-primary text-primary-foreground h-12 w-12 text-xl font-bold">2</div>
                 </div>
                <h3 className="text-lg font-bold">Deposit LSTs</h3>
                <p className="text-sm text-muted-foreground">Deposit your NERO Liquid Staking Tokens (LSTs) into our secure Smart Vault.</p>
              </div>
              <div className="grid gap-1 text-center">
                 <div className="flex justify-center items-center mb-4">
                   <div className="flex items-center justify-center rounded-full bg-primary text-primary-foreground h-12 w-12 text-xl font-bold">3</div>
                 </div>
                <h3 className="text-lg font-bold">Earn & Optimize</h3>
                <p className="text-sm text-muted-foreground">Watch your rewards grow as the Smart Vault and AI optimize your staking strategy automatically.</p>
              </div>
            </div>
          </div>
        </section>


      </main>
    </div>
  );
}

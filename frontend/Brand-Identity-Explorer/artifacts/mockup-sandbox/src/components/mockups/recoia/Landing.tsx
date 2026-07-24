import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Brain, Zap, Target, Network, Layers, Sparkles, Check } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function Landing() {
  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      {/* Navbar */}
      <header className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <Network className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight">RecoIA</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="#" className="hover:text-blue-600 transition-colors">Features</a>
            <a href="#" className="hover:text-blue-600 transition-colors">How It Works</a>
            <a href="#" className="hover:text-blue-600 transition-colors">Pricing</a>
            <a href="#" className="hover:text-blue-600 transition-colors">Blog</a>
          </nav>
          <div className="flex items-center gap-4">
            <Link to="/login">
              <Button variant="ghost" className="hidden md:inline-flex text-slate-600 hover:text-slate-900">Log In</Button>
            </Link>
            <Link to="/register">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6 font-medium">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6 max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <Badge className="mb-6 bg-blue-50 text-blue-700 hover:bg-blue-100 border-none px-3 py-1 rounded-full text-sm font-medium">
            <Sparkles className="w-4 h-4 mr-2" />
            RecoIA 2.0 is now live
          </Badge>
          <h1 className="text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] mb-6 text-slate-900">
            Discover Products You'll Actually Love with AI
          </h1>
          <p className="text-lg text-slate-600 mb-8 leading-relaxed max-w-xl">
            RecoIA uses advanced artificial intelligence to understand your preferences and deliver highly personalized product recommendations based on your interests, browsing behavior, and interactions.
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Link to="/register" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white rounded-full px-8 h-12 text-base font-medium">
                Get Started
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="w-full sm:w-auto rounded-full px-8 h-12 text-base font-medium border-slate-200 text-slate-700 hover:bg-slate-50">
              Learn More
            </Button>
          </div>
        </div>
        <div className="relative h-[400px] lg:h-[500px] w-full bg-slate-50 rounded-3xl overflow-hidden border border-slate-100 flex items-center justify-center">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-100 via-white to-white opacity-50"></div>
          <svg className="w-full h-full text-blue-200 opacity-20 absolute inset-0" viewBox="0 0 100 100" preserveAspectRatio="none">
            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.5"/>
            </pattern>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
          <div className="relative w-64 h-64">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-blue-600 rounded-full shadow-2xl shadow-blue-500/50 flex items-center justify-center z-10">
              <Brain className="w-10 h-10 text-white" />
            </div>
            {[0, 60, 120, 180, 240, 300].map((deg, i) => (
              <div key={i} className="absolute top-1/2 left-1/2 w-full h-full transition-transform duration-1000" style={{ transform: `translate(-50%, -50%) rotate(${deg}deg)` }}>
                <div className="absolute top-0 left-1/2 w-[2px] h-32 bg-gradient-to-t from-blue-600 to-transparent opacity-30 origin-bottom" />
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white border-2 border-blue-200 rounded-full flex items-center justify-center shadow-sm">
                  <div className="w-2.5 h-2.5 bg-blue-600 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-slate-50 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Intelligent by Design</h2>
            <p className="text-slate-600 max-w-2xl mx-auto text-lg">Our models analyze millions of data points to ensure every recommendation feels custom-tailored.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-none shadow-sm bg-white hover:shadow-md transition-shadow">
              <CardContent className="p-8">
                <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-6">
                  <Target className="w-7 h-7 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Personalized AI</h3>
                <p className="text-slate-600 leading-relaxed">Advanced neural networks that understand user intent, context, and subtle preferences beyond basic categories.</p>
              </CardContent>
            </Card>
            <Card className="border-none shadow-sm bg-white hover:shadow-md transition-shadow">
              <CardContent className="p-8">
                <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-6">
                  <Zap className="w-7 h-7 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Real-time Learning</h3>
                <p className="text-slate-600 leading-relaxed">Our models adapt instantly as users interact, meaning the next recommendation is always smarter than the last.</p>
              </CardContent>
            </Card>
            <Card className="border-none shadow-sm bg-white hover:shadow-md transition-shadow">
              <CardContent className="p-8">
                <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-6">
                  <Layers className="w-7 h-7 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Smart Analytics</h3>
                <p className="text-slate-600 leading-relaxed">Deep visibility into how recommendations perform, why they were chosen, and how they impact conversion.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">How AI Recommendations Work</h2>
          <p className="text-slate-600 max-w-2xl mx-auto text-lg">A seamless pipeline from data ingestion to perfect product matching.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8 relative max-w-4xl mx-auto">
          <div className="hidden md:block absolute top-12 left-[20%] right-[20%] h-[2px] bg-slate-100" />
          
          <div className="relative text-center">
            <div className="w-24 h-24 mx-auto bg-white border-[6px] border-slate-50 rounded-full shadow-md flex items-center justify-center mb-6 relative z-10">
              <span className="w-8 h-8 rounded-full bg-slate-900 text-white text-sm font-bold flex items-center justify-center absolute -top-2 -left-2 shadow-sm">1</span>
              <Network className="w-10 h-10 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Collect Data</h3>
            <p className="text-slate-600">We securely aggregate behavioral data, purchase history, and catalogs.</p>
          </div>
          
          <div className="relative text-center">
            <div className="w-24 h-24 mx-auto bg-white border-[6px] border-slate-50 rounded-full shadow-md flex items-center justify-center mb-6 relative z-10">
              <span className="w-8 h-8 rounded-full bg-slate-900 text-white text-sm font-bold flex items-center justify-center absolute -top-2 -left-2 shadow-sm">2</span>
              <Brain className="w-10 h-10 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Analyze Patterns</h3>
            <p className="text-slate-600">Our ML models identify hidden correlations and build user profiles.</p>
          </div>

          <div className="relative text-center">
            <div className="w-24 h-24 mx-auto bg-white border-[6px] border-slate-50 rounded-full shadow-md flex items-center justify-center mb-6 relative z-10">
              <span className="w-8 h-8 rounded-full bg-blue-600 text-white text-sm font-bold flex items-center justify-center absolute -top-2 -left-2 shadow-sm">3</span>
              <Sparkles className="w-10 h-10 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Deliver Matches</h3>
            <p className="text-slate-600">Users see highly relevant products across all touchpoints.</p>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Trusted by Industry Leaders</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                quote: "RecoIA increased our average order value by 24% in just two weeks. The integration was flawless and the results were immediate.",
                name: "Sarah Jenkins",
                role: "VP of E-commerce",
                company: "Luxe & Co",
                initials: "SJ"
              },
              {
                quote: "We replaced our legacy recommendation engine with RecoIA and saw a 3x boost in CTR. The models actually understand what our users want.",
                name: "David Chen",
                role: "CTO",
                company: "TechGear",
                initials: "DC"
              },
              {
                quote: "The analytics dashboard gives us unprecedented insight into why products are recommended. It's like having a team of data scientists on staff.",
                name: "Elena Rodriguez",
                role: "Product Manager",
                company: "StyleHouse",
                initials: "ER"
              }
            ].map((t, i) => (
              <Card key={i} className="bg-slate-800 border-none shadow-xl shadow-slate-950/20">
                <CardContent className="p-8">
                  <p className="text-slate-300 mb-8 italic text-lg leading-relaxed">"{t.quote}"</p>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center font-bold text-white shadow-sm">
                      {t.initials}
                    </div>
                    <div>
                      <h4 className="font-semibold text-white">{t.name}</h4>
                      <p className="text-sm text-slate-400">{t.role}, {t.company}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Simple, Transparent Pricing</h2>
            <p className="text-slate-600 max-w-2xl mx-auto text-lg">Scale your business with predictive intelligence at any size.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Starter */}
            <Card className="border-none shadow-sm bg-white">
              <CardContent className="p-8">
                <h3 className="text-xl font-semibold mb-2 text-slate-900">Starter</h3>
                <div className="mb-6 flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-slate-900">$29</span>
                  <span className="text-slate-500 font-medium">/mo</span>
                </div>
                <ul className="space-y-4 mb-8">
                  {['Up to 10,000 MAU', 'Standard ML Models', 'Basic Analytics', 'Email Support'].map((f, i) => (
                    <li key={i} className="flex items-center text-slate-600">
                      <Check className="w-5 h-5 text-blue-600 mr-3 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button className="w-full bg-slate-100 hover:bg-slate-200 text-slate-900 font-medium h-11">Get Started</Button>
              </CardContent>
            </Card>

            {/* Growth */}
            <Card className="border-2 border-blue-600 shadow-xl shadow-blue-900/10 bg-white relative transform md:-translate-y-4">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-blue-600 text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider shadow-sm">Most Popular</span>
              </div>
              <CardContent className="p-8">
                <h3 className="text-xl font-semibold mb-2 text-slate-900">Growth</h3>
                <div className="mb-6 flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-slate-900">$79</span>
                  <span className="text-slate-500 font-medium">/mo</span>
                </div>
                <ul className="space-y-4 mb-8">
                  {['Up to 50,000 MAU', 'Advanced Neural CF', 'Real-time Learning', 'A/B Testing', 'Priority Support'].map((f, i) => (
                    <li key={i} className="flex items-center text-slate-700 font-medium">
                      <Check className="w-5 h-5 text-blue-600 mr-3 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium h-11 shadow-sm">Start Free Trial</Button>
              </CardContent>
            </Card>

            {/* Enterprise */}
            <Card className="border-none shadow-sm bg-white">
              <CardContent className="p-8">
                <h3 className="text-xl font-semibold mb-2 text-slate-900">Enterprise</h3>
                <div className="mb-6 flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-slate-900">Custom</span>
                </div>
                <ul className="space-y-4 mb-8">
                  {['Unlimited MAU', 'Custom Model Training', 'Dedicated Infrastructure', 'SLA Guarantee', 'Dedicated Success Manager'].map((f, i) => (
                    <li key={i} className="flex items-center text-slate-600">
                      <Check className="w-5 h-5 text-blue-600 mr-3 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button className="w-full bg-slate-100 hover:bg-slate-200 text-slate-900 font-medium h-11">Contact Sales</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-16">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-12">
          <div className="col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                <Network className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl text-slate-900">RecoIA</span>
            </div>
            <p className="text-slate-500 text-sm mb-6 leading-relaxed">
              Predictive intelligence for modern e-commerce. Discover products your users will love.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-slate-900 mb-4">Product</h4>
            <ul className="space-y-3 text-sm text-slate-500">
              <li><a href="#" className="hover:text-blue-600 transition-colors">Features</a></li>
              <li><a href="#" className="hover:text-blue-600 transition-colors">Integrations</a></li>
              <li><a href="#" className="hover:text-blue-600 transition-colors">Pricing</a></li>
              <li><a href="#" className="hover:text-blue-600 transition-colors">Changelog</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-slate-900 mb-4">Company</h4>
            <ul className="space-y-3 text-sm text-slate-500">
              <li><a href="#" className="hover:text-blue-600 transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-blue-600 transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-blue-600 transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-blue-600 transition-colors">Contact</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-slate-900 mb-4">Legal</h4>
            <ul className="space-y-3 text-sm text-slate-500">
              <li><a href="#" className="hover:text-blue-600 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-blue-600 transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 pt-8 mt-12 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-slate-400 text-sm">© 2026 RecoIA. All rights reserved.</p>
          <div className="flex gap-4">
            <div className="w-8 h-8 bg-slate-100 rounded-full hover:bg-slate-200 cursor-pointer transition-colors" />
            <div className="w-8 h-8 bg-slate-100 rounded-full hover:bg-slate-200 cursor-pointer transition-colors" />
            <div className="w-8 h-8 bg-slate-100 rounded-full hover:bg-slate-200 cursor-pointer transition-colors" />
          </div>
        </div>
      </footer>
    </div>
  );
}

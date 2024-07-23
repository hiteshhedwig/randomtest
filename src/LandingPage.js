import React, { useState } from 'react';
import { Gift, Clock, Truck, Search, ChevronDown, Mail, Phone, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';

const LandingPage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-indigo-100">
      <header className="bg-white bg-opacity-90 sticky top-0 z-50 shadow-md">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-purple-600">GiftRush</h1>
          <nav className="hidden md:block">
            <ul className="flex space-x-8">
              {['How it works', 'Gift ideas', 'Pricing', 'Contact'].map((item) => (
                <li key={item}>
                  <Button variant="link" className="text-gray-700 hover:text-purple-600 transition duration-300">
                    {item}
                  </Button>
                </li>
              ))}
            </ul>
          </nav>
          <Button
            variant="outline"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            Menu <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
        {isMenuOpen && (
          <nav className="md:hidden bg-white border-t border-gray-200">
            <ul className="flex flex-col items-center py-4">
              {['How it works', 'Gift ideas', 'Pricing', 'Contact'].map((item) => (
                <li key={item} className="w-full">
                  <Button variant="ghost" className="w-full py-2">
                    {item}
                  </Button>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </header>

      <main className="container mx-auto px-4 py-16">
        <section className="text-center mb-24">
          <h2 className="text-6xl font-extrabold text-gray-800 mb-6">Never Forget a Gift Again</h2>
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
            Elevate your gift-giving game with GiftRush. Find the perfect present for your loved ones in minutes, not hours!
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Button className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-full text-lg shadow-lg hover:shadow-xl transition duration-300">
              Start Shopping Now
            </Button>
            <Button variant="outline" className="border-purple-600 text-purple-600 hover:bg-purple-50 font-bold py-3 px-8 rounded-full text-lg transition duration-300">
              Learn More
            </Button>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-24">
          {[
            { icon: <Clock />, title: "Lightning Fast", description: "Find and order gifts in just a few clicks" },
            { icon: <Gift />, title: "Curated Excellence", description: "Handpicked gifts for every occasion and recipient" },
            { icon: <Truck />, title: "Swift Delivery", description: "Get your gifts delivered right on time" },
            { icon: <Search />, title: "Smart Suggestions", description: "AI-powered personalized gift recommendations" }
          ].map((feature, index) => (
            <FeatureCard key={index} {...feature} />
          ))}
        </section>

        <section className="bg-white rounded-xl shadow-2xl p-8 mb-24">
          <h3 className="text-3xl font-bold text-gray-800 mb-6 text-center">Find the Perfect Gift Now</h3>
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
            <Input placeholder="Recipient's interests" className="flex-grow" />
            <Input placeholder="Occasion" className="flex-grow" />
            <Input placeholder="Budget" className="flex-grow" />
            <Button className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-full">
              Search Gifts
            </Button>
          </div>
        </section>

        <TestimonialSection />
      </main>

      <footer className="bg-gray-800 text-white py-12">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-2xl font-bold mb-4">GiftRush</h3>
            <p>Revolutionizing last-minute gifting with style and efficiency.</p>
          </div>
          <div>
            <h4 className="text-xl font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {['About Us', 'FAQ', 'Privacy Policy', 'Terms of Service'].map((item) => (
                <li key={item}>
                  <Button variant="link" className="text-gray-300 hover:text-white p-0">
                    {item}
                  </Button>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-xl font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-2">
              <li className="flex items-center">
                <Mail className="mr-2 h-4 w-4" /> info@giftrush.com
              </li>
              <li className="flex items-center">
                <Phone className="mr-2 h-4 w-4" /> +1 (555) 123-4567
              </li>
              <li className="flex items-center">
                <MapPin className="mr-2 h-4 w-4" /> 123 Gift Street, Present City, 12345
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-xl font-semibold mb-4">Stay Connected</h4>
            <p className="mb-4">Subscribe to our newsletter for exclusive deals and gift ideas.</p>
            <div className="flex space-x-2">
              <Input placeholder="Your email" className="bg-gray-700 border-gray-600 text-white" />
              <Button className="bg-purple-600 hover:bg-purple-700 text-white">Subscribe</Button>
            </div>
          </div>
        </div>
        <div className="container mx-auto px-4 mt-8 pt-8 border-t border-gray-700 text-center text-gray-400">
          <p>&copy; 2024 GiftRush. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }) => {
  return (
    <Card className="hover:shadow-xl transition duration-300">
      <CardContent className="p-6 text-center">
        <div className="flex justify-center mb-4 text-purple-600">{React.cloneElement(icon, { className: "w-12 h-12" })}</div>
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-gray-600">{description}</p>
      </CardContent>
    </Card>
  );
};

const TestimonialSection = () => {
  const testimonials = [
    { name: "Sarah L.", text: "GiftRush saved my relationship! Found the perfect anniversary gift in minutes." },
    { name: "Mike T.", text: "The AI recommendations are spot-on. It's like having a personal shopper." },
    { name: "Emma R.", text: "Fast, efficient, and the gifts are always high-quality. My go-to for all occasions." }
  ];

  return (
    <section className="mb-24">
      <h3 className="text-3xl font-bold text-gray-800 mb-12 text-center">What Our Customers Say</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {testimonials.map((testimonial, index) => (
          <Card key={index} className="bg-white hover:shadow-xl transition duration-300">
            <CardContent className="p-6">
              <p className="italic mb-4">"{testimonial.text}"</p>
              <p className="font-semibold text-right">- {testimonial.name}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
};

export default LandingPage;
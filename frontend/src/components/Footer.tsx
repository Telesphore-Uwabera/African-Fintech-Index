import React from 'react';
import { Globe, Mail, Phone, MapPin, ExternalLink, Linkedin, Twitter, Facebook, Youtube, ChevronRight, Users, Award, Building2 } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 text-white relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-600/10 via-purple-600/10 to-indigo-600/10"></div>
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-2xl"></div>
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-gradient-to-br from-purple-500/20 to-indigo-500/20 rounded-full blur-2xl"></div>
      </div>
      
      {/* Partnership Banner */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-red-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-6">
              <Users className="w-6 h-6" />
              <h3 className="text-2xl font-bold">Research Partnership</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              {/* Carnegie Mellon University */}
              <div className="flex flex-col items-center space-y-4">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center p-2 shadow-lg">
                  <img 
                    src="https://images.pexels.com/photos/267885/pexels-photo-267885.jpeg" 
                    alt="Carnegie Mellon University Logo" 
                    className="w-full h-full object-contain rounded-full"
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg';
                    }}
                  />
                </div>
                <div className="text-center">
                  <h4 className="font-semibold text-lg">Carnegie Mellon University</h4>
                  <p className="text-sm text-blue-100">Pittsburgh, Pennsylvania, USA</p>
                  <p className="text-xs text-blue-200 mt-1">Computer Science & Engineering Excellence</p>
                </div>
              </div>

              {/* Carnegie Mellon Africa */}
              <div className="flex flex-col items-center space-y-4">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center p-2 shadow-lg">
                  <img 
                    src="https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg" 
                    alt="Carnegie Mellon Africa Logo" 
                    className="w-full h-full object-contain rounded-full"
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.pexels.com/photos/256490/pexels-photo-256490.jpeg';
                    }}
                  />
                </div>
                <div className="text-center">
                  <h4 className="font-semibold text-lg">Carnegie Mellon Africa</h4>
                  <p className="text-sm text-purple-100">Kigali, Rwanda</p>
                  <p className="text-xs text-purple-200 mt-1">Technology Innovation Hub for Africa</p>
                </div>
              </div>

              {/* University of the Witwatersrand */}
              <div className="flex flex-col items-center space-y-4">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center p-2 shadow-lg">
                  <img 
                    src="https://images.pexels.com/photos/207692/pexels-photo-207692.jpeg" 
                    alt="University of the Witwatersrand Logo" 
                    className="w-full h-full object-contain rounded-full"
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.pexels.com/photos/1595391/pexels-photo-1595391.jpeg';
                    }}
                  />
                </div>
                <div className="text-center">
                  <h4 className="font-semibold text-lg">University of the Witwatersrand</h4>
                  <p className="text-sm text-red-100">Johannesburg, South Africa</p>
                  <p className="text-xs text-red-200 mt-1">Leading African Research Institution</p>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-center space-x-3 p-4 bg-white bg-opacity-10 rounded-lg backdrop-blur-sm">
              <Award className="w-6 h-6 text-yellow-300" />
              <span className="text-lg font-semibold">Proudly Funded by AFRETEC NETWORK</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Project Info */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-3 mb-6">
              <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg">
                <Globe className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-black bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">African Fintech Index</h3>
                <p className="text-blue-200 text-sm font-medium">Multi-University Research Initiative</p>
              </div>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed mb-6">
              A collaborative research platform tracking financial technology development across Africa, 
              providing comprehensive insights into digital innovation, investment flows, and regulatory landscapes.
            </p>
            {/* Social Links */}
            <div className="flex space-x-4">
              <a href="#" className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center hover:from-blue-500 hover:to-purple-500 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-110">
                <Linkedin className="w-6 h-6" />
              </a>
              <a href="#" className="w-12 h-12 bg-gradient-to-r from-blue-400 to-purple-400 rounded-xl flex items-center justify-center hover:from-blue-300 hover:to-purple-300 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-110">
                <Twitter className="w-6 h-6" />
              </a>
              <a href="#" className="w-12 h-12 bg-gradient-to-r from-blue-700 to-purple-700 rounded-xl flex items-center justify-center hover:from-blue-600 hover:to-purple-600 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-110">
                <Facebook className="w-6 h-6" />
              </a>
              <a href="#" className="w-12 h-12 bg-gradient-to-r from-red-600 to-purple-600 rounded-xl flex items-center justify-center hover:from-red-500 hover:to-purple-500 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-110">
                <Youtube className="w-6 h-6" />
              </a>
            </div>
          </div>

          {/* Platform Links */}
          <div>
            <h4 className="text-lg font-semibold mb-6">Platform</h4>
            <ul className="space-y-3">
              <li>
                <a href="#dashboard" className="text-gray-300 hover:text-white transition-colors flex items-center group">
                  <ChevronRight className="w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                  Dashboard
                </a>
              </li>
              <li>
                <a href="#analytics" className="text-gray-300 hover:text-white transition-colors flex items-center group">
                  <ChevronRight className="w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                  Interactive Analytics
                </a>
              </li>
              <li>
                <a href="#countries" className="text-gray-300 hover:text-white transition-colors flex items-center group">
                  <ChevronRight className="w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                  Country Rankings
                </a>
              </li>
              <li>
                <a href="#startups" className="text-gray-300 hover:text-white transition-colors flex items-center group">
                  <ChevronRight className="w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                  Fintech Directory
                </a>
              </li>
              <li>
                <a href="#news" className="text-gray-300 hover:text-white transition-colors flex items-center group">
                  <ChevronRight className="w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                  Latest News
                </a>
              </li>
            </ul>
          </div>

          {/* Research & Resources */}
          <div>
            <h4 className="text-lg font-semibold mb-6">Research</h4>
            <ul className="space-y-3">
              <li>
                <a href="#methodology" className="text-gray-300 hover:text-white transition-colors flex items-center group">
                  <ChevronRight className="w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                  Methodology
                </a>
              </li>
              <li>
                <a href="#reports" className="text-gray-300 hover:text-white transition-colors flex items-center group">
                  <ChevronRight className="w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                  Research Reports
                </a>
              </li>
              <li>
                <a href="#publications" className="text-gray-300 hover:text-white transition-colors flex items-center group">
                  <ChevronRight className="w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                  Academic Publications
                </a>
              </li>
              <li>
                <a href="#api" className="text-gray-300 hover:text-white transition-colors flex items-center group">
                  <ChevronRight className="w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                  API Documentation
                </a>
              </li>
              <li>
                <a href="#datasets" className="text-gray-300 hover:text-white transition-colors flex items-center group">
                  <ChevronRight className="w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                  Open Datasets
                </a>
              </li>
            </ul>
          </div>

          {/* Contact & University */}
          <div>
            <h4 className="text-lg font-semibold mb-6">Contact</h4>
            <div className="space-y-4 mb-6">
              <div className="flex items-start space-x-3">
                <Mail className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-white font-medium text-sm">fintech.research@wits.ac.za</p>
                  <p className="text-gray-400 text-xs">Research Inquiries</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Phone className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-white font-medium text-sm">+27 11 717 1000</p>
                  <p className="text-gray-400 text-xs">University Main</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-white font-medium text-sm">1 Jan Smuts Avenue</p>
                  <p className="text-gray-400 text-xs">Braamfontein, Johannesburg</p>
                </div>
              </div>
            </div>

            {/* University Map Link */}
            <a
              href="https://www.google.com/maps/place/University+of+the+Witwatersrand/@-26.192877,28.030426,17z"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 text-sm font-medium"
            >
              <MapPin className="w-4 h-4 flex-shrink-0" />
              <span>View Wits Campus</span>
              <ExternalLink className="w-4 h-4 flex-shrink-0" />
            </a>
          </div>
        </div>
      </div>

      {/* University Partners Banner */}
      <div className="border-t border-gray-800 bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row items-center justify-between space-y-4 lg:space-y-0">
            <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-8">
              {/* Wits University */}
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center p-1">
                  <img 
                    src="https://images.pexels.com/photos/207692/pexels-photo-207692.jpeg" 
                    alt="University of the Witwatersrand" 
                    className="w-full h-full object-contain rounded-lg"
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.pexels.com/photos/1595391/pexels-photo-1595391.jpeg';
                    }}
                  />
                </div>
                <div>
                  <h5 className="text-white font-semibold text-sm">University of the Witwatersrand</h5>
                  <p className="text-gray-400 text-xs">Leading African research institution since 1922</p>
                </div>
              </div>

              {/* Carnegie Mellon */}
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center p-1">
                  <img 
                    src="https://images.pexels.com/photos/267885/pexels-photo-267885.jpeg" 
                    alt="Carnegie Mellon University" 
                    className="w-full h-full object-contain rounded-lg"
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg';
                    }}
                  />
                </div>
                <div>
                  <h5 className="text-white font-semibold text-sm">Carnegie Mellon University</h5>
                  <p className="text-gray-400 text-xs">Global leader in technology and innovation</p>
                </div>
              </div>

              {/* CMU Africa */}
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center p-1">
                  <img 
                    src="https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg" 
                    alt="Carnegie Mellon Africa" 
                    className="w-full h-full object-contain rounded-lg"
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.pexels.com/photos/256490/pexels-photo-256490.jpeg';
                    }}
                  />
                </div>
                <div>
                  <h5 className="text-white font-semibold text-sm">Carnegie Mellon Africa</h5>
                  <p className="text-gray-400 text-xs">Technology innovation hub for Africa</p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center lg:justify-end space-x-4 lg:space-x-6">
              <a href="https://www.wits.ac.za" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white transition-colors text-sm whitespace-nowrap">
                Wits University
              </a>
              <a href="https://www.cmu.edu" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white transition-colors text-sm whitespace-nowrap">
                Carnegie Mellon
              </a>
              <a href="https://www.africa.engineering.cmu.edu" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white transition-colors text-sm whitespace-nowrap">
                CMU Africa
              </a>
              <a href="#about" className="text-gray-300 hover:text-white transition-colors text-sm whitespace-nowrap">
                About Project
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Copyright Bar */}
      <div className="border-t border-gray-700 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-2 md:space-y-0">
            <div className="flex flex-col sm:flex-row items-center space-y-1 sm:space-y-0 sm:space-x-4 text-sm text-gray-400">
              <p>&copy; 2024 University Partnership. All rights reserved.</p>
              <p className="text-xs">Funded by AFRETEC NETWORK</p>
            </div>
            
            <div className="flex flex-wrap items-center justify-center space-x-4 lg:space-x-6 text-sm text-gray-400">
              <a href="#privacy" className="hover:text-white transition-colors whitespace-nowrap">Privacy Policy</a>
              <a href="#terms" className="hover:text-white transition-colors whitespace-nowrap">Terms of Service</a>
              <a href="#accessibility" className="hover:text-white transition-colors whitespace-nowrap">Accessibility</a>
              <a href="#sitemap" className="hover:text-white transition-colors whitespace-nowrap">Sitemap</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
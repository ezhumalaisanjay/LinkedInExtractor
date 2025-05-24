import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  Globe, 
  ChevronDown, 
  Home, 
  Info, 
  Settings, 
  Package, 
  Mail, 
  Share2,
  Clock,
  Brain,
  Users,
  Calendar,
  Building,
  MapPin,
  Phone,
  AtSign,
  Award,
  Megaphone
} from "lucide-react";
import { SiLinkedin, SiX, SiFacebook, SiYoutube, SiInstagram } from "react-icons/si";
import type { AnalysisResult } from "@shared/schema";
import type { SectionState } from "@/lib/types";

interface AnalysisResultsProps {
  data: AnalysisResult;
  activeTab: 'website' | 'linkedin';
  onTabChange: (tab: 'website' | 'linkedin') => void;
}

export default function AnalysisResults({ data, activeTab, onTabChange }: AnalysisResultsProps) {
  const [openSections, setOpenSections] = useState<SectionState>({
    homepage: true,
  });

  const toggleSection = (sectionId: string) => {
    setOpenSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const websiteData = data.website_data;
  const linkedinData = data.linkedin_data;

  const renderWebsiteTab = () => (
    <div className="p-6 space-y-6">
      {/* Website Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
              <Home className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-blue-600 font-medium">Pages Analyzed</p>
              <p className="text-2xl font-bold text-blue-900">
                {Object.keys(websiteData || {}).length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
              <Brain className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-green-600 font-medium">AI Summaries</p>
              <p className="text-2xl font-bold text-green-900">
                {Object.values(websiteData || {}).filter(section => 
                  section && typeof section === 'object' && 'summary' in section
                ).length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-purple-50 to-violet-50 p-4 rounded-lg border border-purple-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
              <Clock className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-purple-600 font-medium">Analysis Time</p>
              <p className="text-2xl font-bold text-purple-900">
                {new Date(data.created_at).toLocaleTimeString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Homepage Section */}
      {websiteData?.home && (
        <Collapsible 
          open={openSections.homepage} 
          onOpenChange={() => toggleSection('homepage')}
        >
          <Card className="border border-gray-200 overflow-hidden">
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className="w-full px-6 py-4 bg-gray-50 hover:bg-gray-100 flex items-center justify-between h-auto"
              >
                <div className="flex items-center space-x-3">
                  <Home className="h-5 w-5 text-blue-500" />
                  <h3 className="text-lg font-semibold text-gray-900">Homepage</h3>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    Analyzed
                  </Badge>
                </div>
                <ChevronDown className={`h-4 w-4 transition-transform ${openSections.homepage ? 'rotate-180' : ''}`} />
              </Button>
            </CollapsibleTrigger>
            
            <CollapsibleContent>
              <CardContent className="px-6 py-4 space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Page Information</h4>
                    <div className="space-y-3">
                      {websiteData.home.page_title && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Page Title</label>
                          <p className="text-sm bg-gray-50 p-3 rounded border">{websiteData.home.page_title}</p>
                        </div>
                      )}
                      {websiteData.home.meta_description && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Meta Description</label>
                          <p className="text-sm bg-gray-50 p-3 rounded border">{websiteData.home.meta_description}</p>
                        </div>
                      )}
                      {websiteData.home.keywords && websiteData.home.keywords.length > 0 && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Keywords</label>
                          <div className="flex flex-wrap gap-2">
                            {websiteData.home.keywords.map((keyword, index) => (
                              <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-800">
                                {keyword}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">AI Summary</h4>
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-100">
                      <p className="text-sm text-blue-900">
                        {websiteData.home.summary || "No summary available"}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      )}

      {/* About Section */}
      {websiteData?.about && (
        <Collapsible 
          open={openSections.about} 
          onOpenChange={() => toggleSection('about')}
        >
          <Card className="border border-gray-200 overflow-hidden">
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className="w-full px-6 py-4 bg-gray-50 hover:bg-gray-100 flex items-center justify-between h-auto"
              >
                <div className="flex items-center space-x-3">
                  <Info className="h-5 w-5 text-blue-500" />
                  <h3 className="text-lg font-semibold text-gray-900">About Us</h3>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    Analyzed
                  </Badge>
                </div>
                <ChevronDown className={`h-4 w-4 transition-transform ${openSections.about ? 'rotate-180' : ''}`} />
              </Button>
            </CollapsibleTrigger>
            
            <CollapsibleContent>
              <CardContent className="px-6 py-4 space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    {websiteData.about.company_name && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                        <p className="text-sm bg-gray-50 p-3 rounded border">{websiteData.about.company_name}</p>
                      </div>
                    )}
                    {websiteData.about.founding_year && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Founded</label>
                        <p className="text-sm bg-gray-50 p-3 rounded border">{websiteData.about.founding_year}</p>
                      </div>
                    )}
                    {websiteData.about.mission_statement && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Mission Statement</label>
                        <p className="text-sm bg-gray-50 p-3 rounded border">{websiteData.about.mission_statement}</p>
                      </div>
                    )}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">AI Summary</h4>
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-100">
                      <p className="text-sm text-purple-900">
                        {websiteData.about.about_summary || "No summary available"}
                      </p>
                    </div>
                    
                    {websiteData.about.leadership_team && websiteData.about.leadership_team.length > 0 && (
                      <div className="mt-4">
                        <h4 className="font-medium text-gray-900 mb-2">Leadership Team</h4>
                        <div className="space-y-2">
                          {websiteData.about.leadership_team.map((member, index) => (
                            <div key={index} className="flex items-center space-x-3 p-2 bg-gray-50 rounded">
                              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                                <Users className="h-4 w-4 text-gray-600" />
                              </div>
                              <div>
                                <p className="text-sm font-medium">{member.name}</p>
                                <p className="text-xs text-gray-600">{member.role}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      )}

      {/* Services Section */}
      {websiteData?.services && (
        <Collapsible 
          open={openSections.services} 
          onOpenChange={() => toggleSection('services')}
        >
          <Card className="border border-gray-200 overflow-hidden">
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className="w-full px-6 py-4 bg-gray-50 hover:bg-gray-100 flex items-center justify-between h-auto"
              >
                <div className="flex items-center space-x-3">
                  <Settings className="h-5 w-5 text-blue-500" />
                  <h3 className="text-lg font-semibold text-gray-900">Services</h3>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    Analyzed
                  </Badge>
                </div>
                <ChevronDown className={`h-4 w-4 transition-transform ${openSections.services ? 'rotate-180' : ''}`} />
              </Button>
            </CollapsibleTrigger>
            
            <CollapsibleContent>
              <CardContent className="px-6 py-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Services List</h4>
                    {websiteData.services.services_list && websiteData.services.services_list.length > 0 ? (
                      <div className="space-y-3">
                        {websiteData.services.services_list.map((service, index) => (
                          <div key={index} className="border border-gray-200 rounded-lg p-4">
                            <h5 className="font-medium text-gray-900">{service.title}</h5>
                            <p className="text-sm text-gray-600 mt-1">{service.description}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No services found</p>
                    )}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">AI Summary</h4>
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-100">
                      <p className="text-sm text-green-900">
                        {websiteData.services.services_summary || "No summary available"}
                      </p>
                    </div>
                    
                    {websiteData.services.industries_served && websiteData.services.industries_served.length > 0 && (
                      <div className="mt-4">
                        <h4 className="font-medium text-gray-900 mb-2">Industries Served</h4>
                        <div className="flex flex-wrap gap-2">
                          {websiteData.services.industries_served.map((industry, index) => (
                            <Badge key={index} variant="secondary" className="bg-indigo-100 text-indigo-800">
                              {industry}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      )}

      {/* Contact Section */}
      {websiteData?.contact && (
        <Collapsible 
          open={openSections.contact} 
          onOpenChange={() => toggleSection('contact')}
        >
          <Card className="border border-gray-200 overflow-hidden">
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className="w-full px-6 py-4 bg-gray-50 hover:bg-gray-100 flex items-center justify-between h-auto"
              >
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-blue-500" />
                  <h3 className="text-lg font-semibold text-gray-900">Contact Information</h3>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    Analyzed
                  </Badge>
                </div>
                <ChevronDown className={`h-4 w-4 transition-transform ${openSections.contact ? 'rotate-180' : ''}`} />
              </Button>
            </CollapsibleTrigger>
            
            <CollapsibleContent>
              <CardContent className="px-6 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {websiteData.contact.email_addresses && websiteData.contact.email_addresses.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                        <AtSign className="mr-2 h-4 w-4 text-blue-500" />
                        Email Addresses
                      </h4>
                      <div className="space-y-2">
                        {websiteData.contact.email_addresses.map((email, index) => (
                          <p key={index} className="text-sm bg-gray-50 p-2 rounded font-mono">{email}</p>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {websiteData.contact.phone_numbers && websiteData.contact.phone_numbers.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                        <Phone className="mr-2 h-4 w-4 text-blue-500" />
                        Phone Numbers
                      </h4>
                      <div className="space-y-2">
                        {websiteData.contact.phone_numbers.map((phone, index) => (
                          <p key={index} className="text-sm bg-gray-50 p-2 rounded font-mono">{phone}</p>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {websiteData.contact.office_locations && websiteData.contact.office_locations.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                        <MapPin className="mr-2 h-4 w-4 text-blue-500" />
                        Office Locations
                      </h4>
                      <div className="space-y-2">
                        {websiteData.contact.office_locations.map((location, index) => (
                          <div key={index} className="text-sm bg-gray-50 p-2 rounded">
                            <p className="text-gray-600">{location}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      )}

      {/* Social Media Section */}
      {websiteData?.social_media && Object.keys(websiteData.social_media).length > 0 && (
        <Collapsible 
          open={openSections.social} 
          onOpenChange={() => toggleSection('social')}
        >
          <Card className="border border-gray-200 overflow-hidden">
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className="w-full px-6 py-4 bg-gray-50 hover:bg-gray-100 flex items-center justify-between h-auto"
              >
                <div className="flex items-center space-x-3">
                  <Share2 className="h-5 w-5 text-blue-500" />
                  <h3 className="text-lg font-semibold text-gray-900">Social Media</h3>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    Analyzed
                  </Badge>
                </div>
                <ChevronDown className={`h-4 w-4 transition-transform ${openSections.social ? 'rotate-180' : ''}`} />
              </Button>
            </CollapsibleTrigger>
            
            <CollapsibleContent>
              <CardContent className="px-6 py-4">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {websiteData.social_media.linkedin_url && (
                    <a href={websiteData.social_media.linkedin_url} target="_blank" rel="noopener noreferrer" 
                       className="flex items-center space-x-2 p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                      <SiLinkedin className="text-blue-600" />
                      <span className="text-sm font-medium text-blue-900">LinkedIn</span>
                    </a>
                  )}
                  {websiteData.social_media.twitter_url && (
                    <a href={websiteData.social_media.twitter_url} target="_blank" rel="noopener noreferrer"
                       className="flex items-center space-x-2 p-3 bg-sky-50 hover:bg-sky-100 rounded-lg transition-colors">
                      <SiX className="text-sky-600" />
                      <span className="text-sm font-medium text-sky-900">Twitter</span>
                    </a>
                  )}
                  {websiteData.social_media.facebook_url && (
                    <a href={websiteData.social_media.facebook_url} target="_blank" rel="noopener noreferrer"
                       className="flex items-center space-x-2 p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                      <SiFacebook className="text-blue-600" />
                      <span className="text-sm font-medium text-blue-900">Facebook</span>
                    </a>
                  )}
                  {websiteData.social_media.youtube_url && (
                    <a href={websiteData.social_media.youtube_url} target="_blank" rel="noopener noreferrer"
                       className="flex items-center space-x-2 p-3 bg-red-50 hover:bg-red-100 rounded-lg transition-colors">
                      <SiYoutube className="text-red-600" />
                      <span className="text-sm font-medium text-red-900">YouTube</span>
                    </a>
                  )}
                  {websiteData.social_media.instagram_url && (
                    <a href={websiteData.social_media.instagram_url} target="_blank" rel="noopener noreferrer"
                       className="flex items-center space-x-2 p-3 bg-pink-50 hover:bg-pink-100 rounded-lg transition-colors">
                      <SiInstagram className="text-pink-600" />
                      <span className="text-sm font-medium text-pink-900">Instagram</span>
                    </a>
                  )}
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      )}
    </div>
  );

  const renderLinkedInTab = () => (
    <div className="p-6 space-y-6">
      {linkedinData ? (
        <>
          {/* LinkedIn Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <SiLinkedin className="text-white" />
                </div>
                <div>
                  <p className="text-sm text-blue-600 font-medium">Followers</p>
                  <p className="text-2xl font-bold text-blue-900">
                    {linkedinData.home?.follower_count || "N/A"}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                  <Users className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-green-600 font-medium">Employees</p>
                  <p className="text-2xl font-bold text-green-900">
                    {linkedinData.home?.employee_count || linkedinData.about?.company_size || "N/A"}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-purple-600 font-medium">Founded</p>
                  <p className="text-2xl font-bold text-purple-900">
                    {linkedinData.about?.founded_year || "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* LinkedIn Profile Details */}
          <Card className="border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <SiLinkedin className="text-blue-600 text-xl" />
                <h3 className="text-lg font-semibold text-gray-900">LinkedIn Profile</h3>
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  Live Data
                </Badge>
              </div>
            </div>
            
            <CardContent className="p-6 space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">
                    {linkedinData.home?.linkedin_name?.substring(0, 2) || "LI"}
                  </span>
                </div>
                <div className="flex-1">
                  <h4 className="text-xl font-bold text-gray-900">
                    {linkedinData.home?.linkedin_name || "LinkedIn Profile"}
                  </h4>
                  <p className="text-gray-600 mt-1">
                    {linkedinData.home?.tagline || "No tagline available"}
                  </p>
                  <div className="flex items-center space-x-4 mt-3 text-sm text-gray-600">
                    <span><Building className="inline mr-1 h-4 w-4" /> {linkedinData.about?.industry || "Technology"}</span>
                    <span><MapPin className="inline mr-1 h-4 w-4" /> {linkedinData.about?.headquarters || "N/A"}</span>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Company Details</h4>
                  <div className="space-y-3">
                    {linkedinData.about?.industry && (
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-sm font-medium text-gray-700">Industry</span>
                        <span className="text-sm text-gray-900">{linkedinData.about.industry}</span>
                      </div>
                    )}
                    {linkedinData.about?.company_size && (
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-sm font-medium text-gray-700">Company Size</span>
                        <span className="text-sm text-gray-900">{linkedinData.about.company_size}</span>
                      </div>
                    )}
                    {linkedinData.about?.type && (
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-sm font-medium text-gray-700">Type</span>
                        <span className="text-sm text-gray-900">{linkedinData.about.type}</span>
                      </div>
                    )}
                    {linkedinData.about?.founded_year && (
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-sm font-medium text-gray-700">Founded</span>
                        <span className="text-sm text-gray-900">{linkedinData.about.founded_year}</span>
                      </div>
                    )}
                    {linkedinData.about?.website && (
                      <div className="flex justify-between py-2">
                        <span className="text-sm font-medium text-gray-700">Website</span>
                        <a href={linkedinData.about.website} target="_blank" rel="noopener noreferrer" 
                           className="text-sm text-blue-500 hover:text-blue-600">
                          {linkedinData.about.website}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
                
                <div>
                  {linkedinData.about?.specialties && linkedinData.about.specialties.length > 0 && (
                    <>
                      <h4 className="font-medium text-gray-900 mb-3">Specialties</h4>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {linkedinData.about.specialties.map((specialty, index) => (
                          <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-800">
                            {specialty}
                          </Badge>
                        ))}
                      </div>
                    </>
                  )}
                  
                  {linkedinData.about?.description && (
                    <>
                      <h4 className="font-medium text-gray-900 mb-2">About</h4>
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-100">
                        <p className="text-sm text-blue-900">
                          {linkedinData.about.description}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card className="border border-gray-200">
          <CardContent className="p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              <SiLinkedin className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">LinkedIn Data Not Available</h3>
            <p className="text-gray-600">
              LinkedIn profile information could not be extracted. This may be due to privacy settings or rate limiting.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );

  return (
    <div className="animate-slide-up">
      {/* Tab Navigation */}
      <div className="bg-white rounded-t-xl shadow-sm border border-b-0 border-gray-200">
        <div className="flex">
          <Button
            variant="ghost"
            onClick={() => onTabChange('website')}
            className={`flex-1 px-6 py-4 text-center font-medium transition-all duration-200 rounded-tl-xl h-auto ${
              activeTab === 'website' 
                ? 'bg-blue-600 text-white border-b-2 border-blue-600' 
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border-b-2 border-transparent'
            }`}
          >
            <Globe className="mr-2 h-4 w-4" />
            Website Analysis
          </Button>
          <Button
            variant="ghost"
            onClick={() => onTabChange('linkedin')}
            className={`flex-1 px-6 py-4 text-center font-medium transition-all duration-200 rounded-tr-xl h-auto ${
              activeTab === 'linkedin' 
                ? 'bg-blue-600 text-white border-b-2 border-blue-600' 
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border-b-2 border-transparent'
            }`}
          >
            <SiLinkedin className="mr-2 h-4 w-4" />
            LinkedIn Profile
          </Button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-b-xl shadow-sm border border-gray-200">
        {activeTab === 'website' ? renderWebsiteTab() : renderLinkedInTab()}
      </div>
    </div>
  );
}

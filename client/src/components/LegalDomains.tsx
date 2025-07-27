import React, { useState } from 'react';
import { Search, ChevronDown, ChevronRight } from 'lucide-react';

interface LegalDomainsProps {
  selectedDomain: string | null;
  onDomainSelect: (domain: string) => void;
}

interface LegalDomainCategory {
  name: string;
  domains: string[];
}

const LegalDomains: React.FC<LegalDomainsProps> = ({
  selectedDomain,
  onDomainSelect,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  const legalDomainCategories: LegalDomainCategory[] = [
    {
      name: 'Civil Law',
      domains: [
        'Personal Injury',
        'Medical Malpractice',
        'Product Liability',
        'Wrongful Death',
        'Slip and Fall',
        'Car Accidents',
        'Premises Liability',
        'Defamation',
        'Invasion of Privacy',
        'Intentional Torts',
        'Negligence',
        'Strict Liability',
      ]
    },
    {
      name: 'Business & Corporate Law',
      domains: [
        'Business Formation',
        'Corporate Governance',
        'Mergers & Acquisitions',
        'Contract Law',
        'Commercial Litigation',
        'Securities Law',
        'Antitrust Law',
        'Bankruptcy',
        'Tax Law',
        'Employment Law',
        'Intellectual Property',
        'Real Estate Law',
      ]
    },
    {
      name: 'Criminal Law',
      domains: [
        'White Collar Crime',
        'Drug Crimes',
        'Violent Crimes',
        'Property Crimes',
        'Sex Crimes',
        'DUI/DWI',
        'Juvenile Law',
        'Criminal Defense',
        'Criminal Appeals',
        'Plea Bargaining',
        'Sentencing',
        'Parole & Probation',
      ]
    },
    {
      name: 'Family Law',
      domains: [
        'Divorce',
        'Child Custody',
        'Child Support',
        'Alimony/Spousal Support',
        'Prenuptial Agreements',
        'Postnuptial Agreements',
        'Adoption',
        'Paternity',
        'Domestic Violence',
        'Guardianship',
        'Estate Planning',
        'Probate',
      ]
    },
    {
      name: 'Intellectual Property',
      domains: [
        'Patent Law',
        'Trademark Law',
        'Copyright Law',
        'Trade Secret Law',
        'IP Litigation',
        'IP Licensing',
        'Domain Name Disputes',
        'Software Patents',
        'Design Patents',
        'Utility Patents',
        'IP Due Diligence',
        'IP Portfolio Management',
      ]
    },
    {
      name: 'Real Estate Law',
      domains: [
        'Residential Real Estate',
        'Commercial Real Estate',
        'Landlord-Tenant Law',
        'Property Development',
        'Zoning & Land Use',
        'Real Estate Finance',
        'Title Insurance',
        'Eminent Domain',
        'Real Estate Litigation',
        'Construction Law',
        'Environmental Law',
        'Real Estate Tax',
      ]
    },
    {
      name: 'Employment Law',
      domains: [
        'Discrimination',
        'Harassment',
        'Wrongful Termination',
        'Wage & Hour Law',
        'Workers Compensation',
        'OSHA Compliance',
        'Labor Relations',
        'Employee Benefits',
        'Non-Compete Agreements',
        'Whistleblower Protection',
        'Employment Contracts',
        'Workplace Safety',
      ]
    },
    {
      name: 'Environmental Law',
      domains: [
        'Environmental Compliance',
        'Clean Air Act',
        'Clean Water Act',
        'CERCLA/Superfund',
        'Environmental Impact Assessment',
        'Climate Change Law',
        'Natural Resources Law',
        'Environmental Litigation',
        'Green Building Law',
        'Waste Management',
        'Energy Law',
        'Sustainability Law',
      ]
    },
    {
      name: 'Healthcare Law',
      domains: [
        'HIPAA Compliance',
        'Medical Malpractice',
        'Healthcare Fraud',
        'Pharmaceutical Law',
        'Medical Device Law',
        'Healthcare Privacy',
        'Healthcare Contracts',
        'Healthcare Employment',
        'Mental Health Law',
        'Public Health Law',
        'Healthcare Insurance',
        'Telemedicine Law',
      ]
    },
    {
      name: 'International Law',
      domains: [
        'International Trade Law',
        'International Human Rights',
        'International Criminal Law',
        'Diplomatic Law',
        'Treaty Law',
        'International Arbitration',
        'Cross-Border Transactions',
        'International Tax',
        'International IP',
        'International Labor Law',
        'International Environmental Law',
        'International Investment Law',
      ]
    },
    {
      name: 'Technology Law',
      domains: [
        'Cybersecurity Law',
        'Data Privacy Law',
        'Artificial Intelligence Law',
        'Blockchain Law',
        'Cryptocurrency Law',
        'Social Media Law',
        'E-Commerce Law',
        'Digital Rights',
        'Technology Licensing',
        'Software Law',
        'Internet Law',
        'Digital Forensics',
      ]
    },
    {
      name: 'Government & Administrative Law',
      domains: [
        'Administrative Law',
        'Constitutional Law',
        'Election Law',
        'Government Contracts',
        'Regulatory Compliance',
        'Public Policy',
        'Municipal Law',
        'State Law',
        'Federal Law',
        'Legislative Law',
        'Judicial Law',
        'Executive Law',
      ]
    }
  ];

  const toggleCategory = (categoryName: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryName)) {
      newExpanded.delete(categoryName);
    } else {
      newExpanded.add(categoryName);
    }
    setExpandedCategories(newExpanded);
  };

  const filteredCategories = legalDomainCategories.map(category => ({
    ...category,
    domains: category.domains.filter(domain =>
      domain.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(category => category.domains.length > 0);

  const handleDomainClick = (domain: string) => {
    onDomainSelect(domain);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-darkbg-700 bg-darkbg-800/60">
        <h3 className="text-lg font-semibold text-accent-blue mb-3">
          Legal Domains
        </h3>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-accent-gray" />
          <input
            type="text"
            placeholder="Search legal domains..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-darkbg-700 border border-darkbg-600 rounded-lg text-white placeholder-accent-gray focus:outline-none focus:ring-2 focus:ring-accent-blue focus:border-transparent"
          />
        </div>
      </div>

      {/* Legal Domains List */}
      <div className="flex-1 overflow-y-auto">
        {filteredCategories.length === 0 ? (
          <div className="p-4 text-center text-accent-gray">
            No legal domains found matching "{searchTerm}"
          </div>
        ) : (
          <div className="p-2">
            {filteredCategories.map((category) => (
              <div key={category.name} className="mb-2">
                <button
                  onClick={() => toggleCategory(category.name)}
                  className="w-full flex items-center justify-between p-3 text-left bg-darkbg-700 hover:bg-darkbg-600 rounded-lg transition-colors"
                >
                  <span className="font-medium text-accent-blue">{category.name}</span>
                  {expandedCategories.has(category.name) ? (
                    <ChevronDown className="w-4 h-4 text-accent-gray" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-accent-gray" />
                  )}
                </button>
                
                {expandedCategories.has(category.name) && (
                  <div className="ml-4 mt-2 space-y-1">
                    {category.domains.map((domain) => (
                      <button
                        key={domain}
                        onClick={() => handleDomainClick(domain)}
                        className={`w-full text-left p-2 rounded-lg transition-colors text-sm ${
                          selectedDomain === domain
                            ? 'bg-accent-blue text-white'
                            : 'bg-darkbg-600 hover:bg-darkbg-500 text-accent-gray hover:text-white'
                        }`}
                      >
                        {domain}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Selected Domain Display */}
      {selectedDomain && (
        <div className="p-4 border-t border-darkbg-700 bg-darkbg-800/60">
          <div className="text-sm text-accent-gray mb-2">Selected:</div>
          <div className="text-accent-blue font-medium">{selectedDomain}</div>
        </div>
      )}
    </div>
  );
};

export default LegalDomains; 
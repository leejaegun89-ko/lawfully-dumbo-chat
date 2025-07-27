import React, { useState } from 'react';
import { Search, ChevronDown, ChevronRight } from 'lucide-react';

interface ImmigrationCaseTypesProps {
  selectedCaseType: string | null;
  onCaseTypeSelect: (caseType: string) => void;
}

interface CaseType {
  name: string;
  forms: string[];
}

interface CaseTypeCategory {
  name: string;
  cases: CaseType[];
}

const ImmigrationCaseTypes: React.FC<ImmigrationCaseTypesProps> = ({
  selectedCaseType,
  onCaseTypeSelect,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  const caseTypeCategories: CaseTypeCategory[] = [
    {
      name: 'Family-Based Immigration',
      cases: [
        {
          name: 'IR-1/CR-1 (Spouse of U.S. Citizen)',
          forms: ['I-130', 'I-485', 'I-864', 'I-693', 'I-765', 'I-131']
        },
        {
          name: 'IR-2/CR-2 (Child of U.S. Citizen)',
          forms: ['I-130', 'I-485', 'I-864', 'I-693', 'I-765', 'I-131']
        },
        {
          name: 'IR-5 (Parent of U.S. Citizen)',
          forms: ['I-130', 'I-485', 'I-864', 'I-693', 'I-765', 'I-131']
        },
        {
          name: 'F1 (Unmarried Son/Daughter of U.S. Citizen)',
          forms: ['I-130', 'I-485', 'I-864', 'I-693', 'I-765', 'I-131']
        },
        {
          name: 'F2A (Spouse/Child of LPR)',
          forms: ['I-130', 'I-485', 'I-864', 'I-693', 'I-765', 'I-131']
        },
        {
          name: 'F2B (Unmarried Son/Daughter of LPR)',
          forms: ['I-130', 'I-485', 'I-864', 'I-693', 'I-765', 'I-131']
        },
        {
          name: 'F3 (Married Son/Daughter of U.S. Citizen)',
          forms: ['I-130', 'I-485', 'I-864', 'I-693', 'I-765', 'I-131']
        },
        {
          name: 'F4 (Sibling of U.S. Citizen)',
          forms: ['I-130', 'I-485', 'I-864', 'I-693', 'I-765', 'I-131']
        },
        {
          name: 'K-1 (Fiancé(e) of U.S. Citizen)',
          forms: ['I-129F', 'DS-160', 'I-134']
        },
        {
          name: 'K-2 (Child of K-1)',
          forms: ['I-129F', 'DS-160', 'I-134']
        },
        {
          name: 'K-3 (Spouse of U.S. Citizen)',
          forms: ['I-130', 'I-129F', 'DS-160', 'I-134']
        },
        {
          name: 'K-4 (Child of K-3)',
          forms: ['I-130', 'I-129F', 'DS-160', 'I-134']
        },
      ]
    },
    {
      name: 'Employment-Based Immigration',
      cases: [
        {
          name: 'EB-1A (Extraordinary Ability)',
          forms: ['I-140', 'I-485', 'I-864', 'I-693', 'I-765', 'I-131']
        },
        {
          name: 'EB-1B (Outstanding Professor/Researcher)',
          forms: ['I-140', 'I-485', 'I-864', 'I-693', 'I-765', 'I-131']
        },
        {
          name: 'EB-1C (Multinational Manager/Executive)',
          forms: ['I-140', 'I-485', 'I-864', 'I-693', 'I-765', 'I-131']
        },
        {
          name: 'EB-2 (Advanced Degree/Exceptional Ability)',
          forms: ['I-140', 'I-485', 'I-864', 'I-693', 'I-765', 'I-131']
        },
        {
          name: 'EB-2 NIW (National Interest Waiver)',
          forms: ['I-140', 'I-485', 'I-864', 'I-693', 'I-765', 'I-131']
        },
        {
          name: 'EB-3 (Skilled Workers/Professionals)',
          forms: ['I-140', 'I-485', 'I-864', 'I-693', 'I-765', 'I-131']
        },
        {
          name: 'EB-3 (Other Workers)',
          forms: ['I-140', 'I-485', 'I-864', 'I-693', 'I-765', 'I-131']
        },
        {
          name: 'EB-4 (Special Immigrants)',
          forms: ['I-360', 'I-485', 'I-864', 'I-693', 'I-765', 'I-131']
        },
        {
          name: 'EB-5 (Investor)',
          forms: ['I-526', 'I-485', 'I-864', 'I-693', 'I-765', 'I-131']
        },
        {
          name: 'H-1B (Specialty Occupation)',
          forms: ['I-129', 'I-907', 'LCA', 'I-485', 'I-765', 'I-131']
        },
        {
          name: 'H-2A (Agricultural Workers)',
          forms: ['I-129', 'ETA-9142A', 'I-485', 'I-765', 'I-131']
        },
        {
          name: 'H-2B (Non-Agricultural Workers)',
          forms: ['I-129', 'ETA-9142B', 'I-485', 'I-765', 'I-131']
        },
        {
          name: 'H-3 (Trainee)',
          forms: ['I-129', 'I-485', 'I-765', 'I-131']
        },
        {
          name: 'L-1A (Intracompany Transferee - Manager/Executive)',
          forms: ['I-129', 'I-907', 'I-485', 'I-765', 'I-131']
        },
        {
          name: 'L-1B (Intracompany Transferee - Specialized Knowledge)',
          forms: ['I-129', 'I-907', 'I-485', 'I-765', 'I-131']
        },
        {
          name: 'O-1 (Extraordinary Ability)',
          forms: ['I-129', 'I-907', 'I-485', 'I-765', 'I-131']
        },
        {
          name: 'P-1 (Athletes/Entertainers)',
          forms: ['I-129', 'I-907', 'I-485', 'I-765', 'I-131']
        },
        {
          name: 'P-2 (Artists/Entertainers)',
          forms: ['I-129', 'I-907', 'I-485', 'I-765', 'I-131']
        },
        {
          name: 'P-3 (Artists/Entertainers)',
          forms: ['I-129', 'I-907', 'I-485', 'I-765', 'I-131']
        },
        {
          name: 'TN (Trade NAFTA)',
          forms: ['I-129', 'I-907', 'I-485', 'I-765', 'I-131']
        },
        {
          name: 'E-1 (Treaty Traders)',
          forms: ['DS-160', 'I-129', 'I-485', 'I-765', 'I-131']
        },
        {
          name: 'E-2 (Treaty Investors)',
          forms: ['DS-160', 'I-129', 'I-485', 'I-765', 'I-131']
        },
      ]
    },
    {
      name: 'DOL (Department of Labor)',
      cases: [
        {
          name: 'PERM (Program Electronic Review Management)',
          forms: ['ETA-9089', 'ETA-9141', 'ETA-9035']
        },
        {
          name: 'Prevailing Wage Determination (PWD)',
          forms: ['ETA-9141', 'ETA-9142']
        },
        {
          name: 'Labor Condition Application (LCA)',
          forms: ['ETA-9035', 'ETA-9035E']
        },
        {
          name: 'ETA-9089 (PERM Application)',
          forms: ['ETA-9089']
        },
        {
          name: 'ETA-9035 (LCA Form)',
          forms: ['ETA-9035', 'ETA-9035E']
        },
        {
          name: 'ETA-9141 (Prevailing Wage Request)',
          forms: ['ETA-9141']
        },
        {
          name: 'ETA-9142 (Application for Prevailing Wage Determination)',
          forms: ['ETA-9142']
        },
        {
          name: 'Audit Response (PERM)',
          forms: ['ETA-9089', 'Supporting Documentation']
        },
        {
          name: 'Supervised Recruitment',
          forms: ['ETA-9089', 'Recruitment Documentation']
        },
        {
          name: 'Reduction in Recruitment (RIR)',
          forms: ['ETA-9089', 'Recruitment Documentation']
        },
        {
          name: 'Standard Recruitment',
          forms: ['ETA-9089', 'Recruitment Documentation']
        },
        {
          name: 'Job Order',
          forms: ['Job Order Documentation']
        },
        {
          name: 'Newspaper Advertisements',
          forms: ['Advertisement Documentation']
        },
        {
          name: 'Professional Journal Advertisements',
          forms: ['Advertisement Documentation']
        },
        {
          name: 'Internal Posting Requirements',
          forms: ['Internal Posting Documentation']
        },
        {
          name: 'Notice of Filing',
          forms: ['Notice of Filing Documentation']
        },
        {
          name: 'Recruitment Report',
          forms: ['Recruitment Report Documentation']
        },
        {
          name: 'Final Recruitment Report',
          forms: ['Final Recruitment Report Documentation']
        },
        {
          name: 'Audit Documentation',
          forms: ['Audit Documentation Package']
        },
        {
          name: 'Appeal Process (PERM)',
          forms: ['Appeal Documentation', 'BALCA Forms']
        },
        {
          name: 'Reconsideration Request',
          forms: ['Reconsideration Request Documentation']
        },
        {
          name: 'Board of Alien Labor Certification Appeals (BALCA)',
          forms: ['BALCA Appeal Forms', 'Supporting Documentation']
        },
        {
          name: 'DOL Investigation',
          forms: ['Investigation Response Documentation']
        },
        {
          name: 'Wage and Hour Division (WHD) Investigation',
          forms: ['WHD Investigation Response']
        },
        {
          name: 'Office of Foreign Labor Certification (OFLC)',
          forms: ['OFLC Application Forms']
        },
        {
          name: 'National Prevailing Wage Center (NPWC)',
          forms: ['ETA-9141', 'ETA-9142']
        },
        {
          name: 'Chicago National Processing Center (CNPC)',
          forms: ['CNPC Application Forms']
        },
        {
          name: 'Atlanta National Processing Center (ANPC)',
          forms: ['ANPC Application Forms']
        },
        {
          name: 'DOL Processing Times',
          forms: ['Processing Time Inquiries']
        },
        {
          name: 'DOL Case Status Check',
          forms: ['Case Status Inquiry Forms']
        },
        {
          name: 'DOL Case Number Tracking',
          forms: ['Case Tracking Documentation']
        },
        {
          name: 'DOL Online System (iCERT)',
          forms: ['iCERT System Documentation']
        },
        {
          name: 'DOL Public Access File (PAF)',
          forms: ['PAF Documentation Requirements']
        },
        {
          name: 'DOL Compliance Requirements',
          forms: ['Compliance Documentation']
        },
        {
          name: 'DOL Recordkeeping Requirements',
          forms: ['Recordkeeping Documentation']
        },
        {
          name: 'DOL Reporting Requirements',
          forms: ['Reporting Documentation']
        },
        {
          name: 'DOL Penalties and Fines',
          forms: ['Penalty Assessment Documentation']
        },
        {
          name: 'DOL Enforcement Actions',
          forms: ['Enforcement Action Documentation']
        },
        {
          name: 'DOL Settlement Agreements',
          forms: ['Settlement Agreement Documentation']
        },
        {
          name: 'DOL Consent Decrees',
          forms: ['Consent Decree Documentation']
        },
        {
          name: 'DOL Administrative Law Judge (ALJ) Hearings',
          forms: ['ALJ Hearing Documentation']
        },
        {
          name: 'DOL Administrative Review Board (ARB)',
          forms: ['ARB Appeal Documentation']
        },
        {
          name: 'DOL Federal Court Appeals',
          forms: ['Federal Court Appeal Documentation']
        },
        {
          name: 'DOL Class Action Lawsuits',
          forms: ['Class Action Documentation']
        },
        {
          name: 'DOL Whistleblower Protection',
          forms: ['Whistleblower Protection Forms']
        },
        {
          name: 'DOL Retaliation Claims',
          forms: ['Retaliation Claim Documentation']
        },
        {
          name: 'DOL Back Wage Claims',
          forms: ['Back Wage Claim Documentation']
        },
        {
          name: 'DOL Liquidated Damages',
          forms: ['Liquidated Damages Documentation']
        },
        {
          name: 'DOL Civil Money Penalties',
          forms: ['Civil Money Penalty Documentation']
        },
        {
          name: 'DOL Debarment',
          forms: ['Debarment Documentation']
        },
        {
          name: 'DOL Disqualification',
          forms: ['Disqualification Documentation']
        },
        {
          name: 'DOL Reinstatement',
          forms: ['Reinstatement Documentation']
        },
        {
          name: 'DOL Compliance Monitoring',
          forms: ['Compliance Monitoring Documentation']
        },
        {
          name: 'DOL Training Requirements',
          forms: ['Training Documentation']
        },
        {
          name: 'DOL Certification Requirements',
          forms: ['Certification Documentation']
        },
        {
          name: 'DOL Renewal Process',
          forms: ['Renewal Documentation']
        },
        {
          name: 'DOL Amendment Process',
          forms: ['Amendment Documentation']
        },
        {
          name: 'DOL Withdrawal Process',
          forms: ['Withdrawal Documentation']
        },
        {
          name: 'DOL Denial Process',
          forms: ['Denial Response Documentation']
        },
        {
          name: 'DOL Appeal Deadlines',
          forms: ['Appeal Deadline Documentation']
        },
        {
          name: 'DOL Response Deadlines',
          forms: ['Response Deadline Documentation']
        },
        {
          name: 'DOL Extension Requests',
          forms: ['Extension Request Documentation']
        },
        {
          name: 'DOL Expedited Processing',
          forms: ['Expedited Processing Request']
        },
        {
          name: 'DOL Premium Processing',
          forms: ['Premium Processing Request']
        },
        {
          name: 'DOL Regular Processing',
          forms: ['Regular Processing Documentation']
        },
        {
          name: 'DOL Case Transfer',
          forms: ['Case Transfer Documentation']
        },
        {
          name: 'DOL Case Consolidation',
          forms: ['Case Consolidation Documentation']
        },
        {
          name: 'DOL Case Separation',
          forms: ['Case Separation Documentation']
        },
        {
          name: 'DOL Case Reopening',
          forms: ['Case Reopening Documentation']
        },
        {
          name: 'DOL Case Reconsideration',
          forms: ['Case Reconsideration Documentation']
        },
        {
          name: 'DOL Case Modification',
          forms: ['Case Modification Documentation']
        },
        {
          name: 'DOL Case Cancellation',
          forms: ['Case Cancellation Documentation']
        },
        {
          name: 'DOL Case Termination',
          forms: ['Case Termination Documentation']
        },
        {
          name: 'DOL Case Suspension',
          forms: ['Case Suspension Documentation']
        },
        {
          name: 'DOL Case Resumption',
          forms: ['Case Resumption Documentation']
        },
        {
          name: 'DOL Case Completion',
          forms: ['Case Completion Documentation']
        },
        {
          name: 'DOL Case Closure',
          forms: ['Case Closure Documentation']
        },
      ]
    },
    {
      name: 'Humanitarian & Special Programs',
      cases: [
        {
          name: 'Asylum',
          forms: ['I-589', 'I-765', 'I-131', 'I-730']
        },
        {
          name: 'Refugee',
          forms: ['I-590', 'I-730', 'I-765', 'I-131']
        },
        {
          name: 'Temporary Protected Status (TPS)',
          forms: ['I-821', 'I-765', 'I-601', 'I-601A']
        },
        {
          name: 'Deferred Action for Childhood Arrivals (DACA)',
          forms: ['I-821D', 'I-765', 'I-601', 'I-601A']
        },
        {
          name: 'U Visa (Crime Victims)',
          forms: ['I-918', 'I-918A', 'I-765', 'I-131']
        },
        {
          name: 'T Visa (Trafficking Victims)',
          forms: ['I-914', 'I-914A', 'I-765', 'I-131']
        },
        {
          name: 'VAWA (Violence Against Women Act)',
          forms: ['I-360', 'I-485', 'I-765', 'I-131']
        },
        {
          name: 'Special Immigrant Juvenile Status (SIJS)',
          forms: ['I-360', 'I-485', 'I-765', 'I-131']
        },
        {
          name: 'Parole in Place',
          forms: ['I-131', 'Supporting Documentation']
        },
        {
          name: 'Humanitarian Parole',
          forms: ['I-131', 'Supporting Documentation']
        },
        {
          name: 'Deferred Action',
          forms: ['I-821', 'Supporting Documentation']
        },
        {
          name: 'Cancellation of Removal',
          forms: ['I-881', 'Supporting Documentation']
        },
        {
          name: 'Adjustment of Status',
          forms: ['I-485', 'I-864', 'I-693', 'I-765', 'I-131']
        },
        {
          name: 'Consular Processing',
          forms: ['DS-260', 'DS-160', 'Supporting Documentation']
        },
      ]
    },
    {
      name: 'Student & Exchange Programs',
      cases: [
        {
          name: 'F-1 (Academic Student)',
          forms: ['I-20', 'DS-160', 'I-765', 'I-539']
        },
        {
          name: 'F-2 (Dependent of F-1)',
          forms: ['I-20', 'DS-160', 'I-539']
        },
        {
          name: 'M-1 (Vocational Student)',
          forms: ['I-20', 'DS-160', 'I-765', 'I-539']
        },
        {
          name: 'M-2 (Dependent of M-1)',
          forms: ['I-20', 'DS-160', 'I-539']
        },
        {
          name: 'J-1 (Exchange Visitor)',
          forms: ['DS-2019', 'DS-160', 'I-765', 'I-539']
        },
        {
          name: 'J-2 (Dependent of J-1)',
          forms: ['DS-2019', 'DS-160', 'I-765', 'I-539']
        },
        {
          name: 'OPT (Optional Practical Training)',
          forms: ['I-765', 'I-20', 'Supporting Documentation']
        },
        {
          name: 'STEM OPT Extension',
          forms: ['I-765', 'I-20', 'I-983', 'Supporting Documentation']
        },
        {
          name: 'CPT (Curricular Practical Training)',
          forms: ['I-20', 'Supporting Documentation']
        },
      ]
    },
    {
      name: 'Other Visa Categories',
      cases: [
        {
          name: 'B-1 (Business Visitor)',
          forms: ['DS-160', 'Supporting Documentation']
        },
        {
          name: 'B-2 (Tourist)',
          forms: ['DS-160', 'Supporting Documentation']
        },
        {
          name: 'C-1 (Transit)',
          forms: ['DS-160', 'Supporting Documentation']
        },
        {
          name: 'D (Crew Member)',
          forms: ['DS-160', 'Supporting Documentation']
        },
        {
          name: 'A-1/A-2 (Diplomatic)',
          forms: ['DS-160', 'Diplomatic Note']
        },
        {
          name: 'G-1/G-2 (International Organization)',
          forms: ['DS-160', 'International Organization Documentation']
        },
        {
          name: 'NATO-1/NATO-2 (NATO Officials)',
          forms: ['DS-160', 'NATO Documentation']
        },
        {
          name: 'R-1 (Religious Workers)',
          forms: ['I-129', 'I-907', 'I-485', 'I-765', 'I-131']
        },
        {
          name: 'Q-1 (Cultural Exchange)',
          forms: ['I-129', 'I-907', 'I-485', 'I-765', 'I-131']
        },
        {
          name: 'I (Media Representatives)',
          forms: ['DS-160', 'Media Documentation']
        },
        {
          name: 'S (Informants)',
          forms: ['DS-160', 'Law Enforcement Documentation']
        },
      ]
    },
    {
      name: 'Citizenship & Naturalization',
      cases: [
        {
          name: 'Naturalization (N-400)',
          forms: ['N-400', 'N-600', 'Supporting Documentation']
        },
        {
          name: 'Derivative Citizenship',
          forms: ['N-600', 'Supporting Documentation']
        },
        {
          name: 'Certificate of Citizenship (N-600)',
          forms: ['N-600', 'Supporting Documentation']
        },
        {
          name: 'Repatriation',
          forms: ['N-600', 'Supporting Documentation']
        },
        {
          name: 'Dual Citizenship',
          forms: ['N-600', 'Supporting Documentation']
        },
        {
          name: 'Renunciation of Citizenship',
          forms: ['DS-4079', 'Supporting Documentation']
        },
      ]
    },
    {
      name: 'Removal & Deportation',
      cases: [
        {
          name: 'Removal Proceedings',
          forms: ['I-589', 'I-765', 'I-131', 'Supporting Documentation']
        },
        {
          name: 'Bond Hearings',
          forms: ['I-286', 'Supporting Documentation']
        },
        {
          name: 'Cancellation of Removal',
          forms: ['I-881', 'Supporting Documentation']
        },
        {
          name: 'Adjustment of Status in Removal',
          forms: ['I-485', 'I-864', 'I-693', 'Supporting Documentation']
        },
        {
          name: 'Asylum in Removal',
          forms: ['I-589', 'I-765', 'I-131', 'Supporting Documentation']
        },
        {
          name: 'Withholding of Removal',
          forms: ['I-589', 'I-765', 'I-131', 'Supporting Documentation']
        },
        {
          name: 'Convention Against Torture (CAT)',
          forms: ['I-589', 'I-765', 'I-131', 'Supporting Documentation']
        },
        {
          name: 'Voluntary Departure',
          forms: ['I-286', 'Supporting Documentation']
        },
        {
          name: 'Administrative Closure',
          forms: ['Motion for Administrative Closure']
        },
        {
          name: 'Termination of Proceedings',
          forms: ['Motion to Terminate Proceedings']
        },
      ]
    },
    {
      name: 'Appeals & Motions',
      cases: [
        {
          name: 'BIA Appeals',
          forms: ['EOIR-26', 'EOIR-27', 'EOIR-28', 'EOIR-29']
        },
        {
          name: 'Federal Court Appeals',
          forms: ['Federal Court Forms', 'Supporting Documentation']
        },
        {
          name: 'Motions to Reopen',
          forms: ['Motion to Reopen Documentation']
        },
        {
          name: 'Motions to Reconsider',
          forms: ['Motion to Reconsider Documentation']
        },
        {
          name: 'Motions to Stay',
          forms: ['Motion to Stay Documentation']
        },
        {
          name: 'Writ of Mandamus',
          forms: ['Writ of Mandamus Documentation']
        },
        {
          name: 'Habeas Corpus',
          forms: ['Habeas Corpus Documentation']
        },
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

  const filteredCategories = caseTypeCategories.map(category => ({
    ...category,
    cases: category.cases.filter(caseType =>
      caseType.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      caseType.forms.some(form => form.toLowerCase().includes(searchTerm.toLowerCase()))
    )
  })).filter(category => category.cases.length > 0);

  const handleCaseTypeClick = (caseType: string) => {
    onCaseTypeSelect(caseType);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-darkbg-700 bg-darkbg-800/60">
        <h3 className="text-lg font-semibold text-accent-blue mb-3">
          Immigration Case Types
        </h3>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-accent-gray" />
          <input
            type="text"
            placeholder="Search case types or forms..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-darkbg-700 border border-darkbg-600 rounded-lg text-white placeholder-accent-gray focus:outline-none focus:ring-2 focus:ring-accent-blue focus:border-transparent"
          />
        </div>
      </div>

      {/* Case Types List */}
      <div className="flex-1 overflow-y-auto">
        {filteredCategories.length === 0 ? (
          <div className="p-4 text-center text-accent-gray">
            No case types found matching "{searchTerm}"
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
                    {category.cases.map((caseType) => (
                      <button
                        key={caseType.name}
                        onClick={() => handleCaseTypeClick(caseType.name)}
                        className={`w-full text-left p-3 rounded-lg transition-colors text-sm ${
                          selectedCaseType === caseType.name
                            ? 'bg-accent-blue text-white'
                            : 'bg-darkbg-600 hover:bg-darkbg-500 text-accent-gray hover:text-white'
                        }`}
                      >
                        <div className="font-medium mb-1">{caseType.name}</div>
                        <div className="text-xs opacity-75">
                          Forms: {caseType.forms.join(', ')}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Selected Case Type Display */}
      {selectedCaseType && (
        <div className="p-4 border-t border-darkbg-700 bg-darkbg-800/60">
          <div className="text-sm text-accent-gray mb-2">Selected:</div>
          <div className="text-accent-blue font-medium">{selectedCaseType}</div>
        </div>
      )}
    </div>
  );
};

export default ImmigrationCaseTypes; 
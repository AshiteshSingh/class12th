export const ZONAL_PARTICIPANTS = {
    'Senior Category': [
        'Rakshit Kumar Singh',
        'Avika Singh',
        'Astha Tripathi',
        'Gauri Shukla',
        'Prakhar Mishra',
        'Kabya Tripathi',
        'Anshika Singh',
        'Yashasvi Rao',
        'Bhaskar Anand',
        'Alankriti Sharma',
        'Anvesh Singh',
        'Aadyot Pandey',
        'Bharika Singh'
    ],
    'Junior Category': [
        'Yasharth Kesarwani',
        'Darsh Srivastava',
        'Kavya Raj Tripathi',
        'Ashra Khan',
        'Pawni Trikha',
        'Anjali Kumari',
        'Ananya Srivastava',
        'Ojas Rai',
        'Priyanshi Mishra',
        'Harshit Kumar',
        'Ashutosh Yadav',
        'Arnav Kumar Lal',
        'Aastha Verma'
    ],
    'Sub-Junior Category': [
        'Mantrsha Gupta',
        'Samriddhi Satish',
        'Samiksha Shukla',
        'Sifat Singh Kohli',
        'Utkarsh Singh',
        'Dishka Sharma'
    ]
};

export const ALL_ZONAL_PARTICIPANTS = [
    ...ZONAL_PARTICIPANTS['Senior Category'].map((name, i) => ({ id: `sr-${i+1}`, name, category: 'Senior Category', categoryShort: 'Senior' })),
    ...ZONAL_PARTICIPANTS['Junior Category'].map((name, i) => ({ id: `jr-${i+1}`, name, category: 'Junior Category', categoryShort: 'Junior' })),
    ...ZONAL_PARTICIPANTS['Sub-Junior Category'].map((name, i) => ({ id: `subjr-${i+1}`, name, category: 'Sub-Junior Category', categoryShort: 'Sub-Junior' }))
];

export const DEFAULT_CRITERIA = [
    { key: 's1', label: 'Pronunciation Clarity', max: 10 },
    { key: 's2', label: 'Voice Modulation', max: 10 },
    { key: 's3', label: 'Confidence', max: 10 },
    { key: 's4', label: 'Overall Impact', max: 10 },
    { key: 's5', label: 'Effectiveness', max: 10 },
];

export const EVENT_CRITERIA = {
    'Debate': [
        { key: 's1', label: 'Content', max: 20 },
        { key: 's2', label: 'Delivery (Style, Fluency, Clarity, Poise)', max: 20 },
        { key: 's3', label: 'Rebuttal', max: 5 },
        { key: 's4', label: 'Overall Impact', max: 5 },
    ],
    'Story Telling': [
        { key: 's1', label: 'Language Clarity & Pronunciation', max: 10 },
        { key: 's2', label: 'Intonation and voice modulation', max: 10 },
        { key: 's3', label: 'Fluency and confidence', max: 10 },
        { key: 's4', label: 'Memorisation and expression', max: 10 },
        { key: 's5', label: 'Moral of the story', max: 10 },
    ],
};

export const getCriteriaForEvent = (eventName) => {
    if (!eventName) return DEFAULT_CRITERIA;
    const key = Object.keys(EVENT_CRITERIA).find(k => eventName.toLowerCase().includes(k.toLowerCase()));
    return key ? EVENT_CRITERIA[key] : DEFAULT_CRITERIA;
};

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

const ConstantsMedicine = {
    MedicineStatusOptions: [
        {value: "Ważność 3 miesiące", label: "Ważność 3 miesiące"},
        {value: "Ważność 1 miesiąc", label: "Ważność 1 miesiąc"},
        {value: "Przeterminowane", label: "Przeterminowane"},
        {value: "Ważny", label: "Ważny"},
    ],

    StatusOptions: [
        {value: "Do zamówienia", label: "Do zamówienia"},
        {value: "Uwaga Ilość", label: "Uwaga Ilość"},
        {value: "W porządku", label: "W porządku"},
    ],

    BoxTypeOptions: [
        {value: "amp", label: "amp"},
        {value: "tabl", label: "tabl"},
        {value: "czopki", label: "czopki"},
        {value: "kaps", label: "kaps"},
        {value: "g", label: "g"},
        {value: "saszetek", label: "saszetek"},
        {value: "op", label: "op"},
        {value: "dawek", label: "dawek"},
        {value: "ml", label: "ml"},
        {value: "pastylki", label: "pastylki"},
        {value: "tab", label: "tab"},
        {value: "fiolki", label: "fiolki"},
        {value: "szt", label: "szt"},
        {value: "mg", label: "mg"},

    ],

    StoringOptions: [
        {value: "freezer", label: "freezer"},
        {value: "szafka", label: "szafka"},
        {value: "narkotyk", label: "narkotyk"},
    ],

    CategoryOptions: [
        {value: 1, label: "Sercowo - naczyniowe"},
        {value: 2, label: "Układ trawienny"},
        {value: 3, label: "Przeciwbólowe"},
        {value: 4, label: "Układ nerwowy"},
        {value: 5, label: "Przeciwuczuleniowe i Przeciwwstrząsowe"},
        {value: 6, label: "Układ oddechowy"},
        {value: 7, label: "Przeciwzakaźne"},
        {value: 8, label: "Preparaty nawadniające, odżywcze i osoczowe"},
        {value: 9, label: "Do użytku zewnętrznego"},
        {value: 10, label: "Poza katalogiem minimum"},
        {value: 27, label: "Bez kategorii"},
    ],

    SubCategoryOptions: {
        1: [
            {value: 1, label: "Analeptyki sercowokrążeniowe"},
            {value: 2, label: "Preparaty przeciw dusznicy bolesnej"},
            {value: 3, label: "Moczopędne"},
            {value: 4, label: "Przeciwkrwotoczne"},
            {value: 5, label: "Hipotensyjne"},
        ],
        2: [
            {value: 6, label: "Choroby żołądka i dwunastnicy"},
            {value: 7, label: "Przeciwwymiotne / 4.3 przeciw chorobie morskiej"},
            {value: 8, label: "Przeczyszczające"},
            {value: 9, label: "Przeciwbiegunkowe"},
            {value: 10, label: "Antyseptyki  jelitowe"},
            {value: 11, label: "Przeciw hemoroidom"},
        ],
        3: [
            {value: 12, label: "Przeciwgorączkowe, przeciwzapalne"},
            {value: 13, label: "Silne środki przeciwbólowe"},
            {value: 14, label: "Spazmolityki"},
        ],
        4: [
            {value: 15, label: "Anksjolityki"},
            {value: 16, label: "Neuroleptyki"},
            {value: 17, label: "Przeciw chorobie morskiej - patrz pkt. 2.2"},
            {value: 18, label: "Przeciwpadaczkowe"},
        ],
        5: [
            {value: 19, label: "Przeciwhistaminowe receptory H1"},
            {value: 20, label: "Glikokortykosteroidy do wstrzyknięćlikokortykosteroidy do wstrzyknięć"},
        ],
        6: [
            {value: 21, label: "Preparaty bronchospasmolityczne"},
            {value: 22, label: "Przeciwkaszlowe"},
            {value: 23, label: "Przeziębienie zapalenie zatok"},
        ],
        7: [
            {value: 24, label: "Antybiotyki (co najmniej 2 grupy)"},
            {value: 25, label: "Sulfonamidy przeciwbakteryjne"},
            {value: 26, label: "Antyseptyki dróg moczowych"},
            {value: 27, label: "Przeciwpasożytnicze"},
            {value: 28, label: "Zakażenia jelitowe"},
        ],
        8: [],
        9: [
            {value: 29, label: "Dermatologiczne"},
            {value: 30, label: "Okulistyczne"},
            {value: 31, label: "Ucho"},
            {value: 32, label: "Zakażenia jamy ustnej i gardła"},
            {value: 33, label: "Miejscowe środki znieczulające"},
        ],
        10: [],
    },

    SubSubCategoryOptions: {
        2: {
            6: [
                {value: 1, label: "Przeciwhistaminowe receptory H2"},
                {value: 2, label: "Zobojętniające"},
            ],
        },
        9: {
            29: [
                {value: 3, label: "Roztwory antyseptyczne"},
                {value: 4, label: "Maści antybiotykowe"},
                {value: 5, label: "Maści przeciwzapalne"},
                {value: 6, label: "Przeciwgrzybiczne "},
                {value: 7, label: "Oparzenia"},

            ],
            30: [
                {value: 8, label: "Z antybiotykami i przeciwzapalne"},
                {value: 9, label: "Znieczulające"},
                {value: 10, label: "Zwężające źrenicę i obniżające ciśnienie śródgałkowe"},
            ],
            31: [
                {value: 11, label: "Roztwory antybiotyków"},
                {value: 12, label: "Znieczulające i przeciwzapalne"},
            ],
            33: [
                {value: 13, label: "Działające przez zamrożenie"},
                {value: 14, label: "Do iniekcji śródskórnej"},
            ],


        }

    },
}


export default ConstantsMedicine;
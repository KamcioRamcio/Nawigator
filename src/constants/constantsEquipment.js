const constantsEquipment = {
    StatusOptions: [
        {value: "Do zamówienia", label: "Do zamówienia"},
        {value: "Uwaga Ilość", label: "Uwaga Ilość"},
        {value: "W porządku", label: "W porządku"},
    ],
    EquipmentStatusOptions: [
        {value: "Ważność 3 miesiące", label: "Ważność 3 miesiące"},
        {value: "Ważność 1 miesiąc", label: "Ważność 1 miesiąc"},
        {value: "Przeterminowane", label: "Przeterminowane"},
        {value: "Ważny", label: "Ważny"},
    ],
    CategoryOptions: [
        {value: 1, label: "Sprzęt resuscytacyjny"},
        {value: 2, label: "Sprzęt opatrunkowy"},
        {value: 3, label: "Narzędzia"},
        {value: 4, label: "Sprzęt diagnostyczny i monitorujący"},
        {value: 5, label: "Sprzęt do iniekcji, perfuzji, punkcji i cewnikowania"},
        {value: 6, label: "Ogólny sprzęt medyczny"},
        {value: 7, label: "Sprzęt unieruchamiający i do nastawiania kości"},
        {value: 8, label: "Dezynfekcja, dezynsekcja i zapobieganie"},
        {value: 9, label: "Poza katalogiem minimum "},
    ],
    SubCategoryOptions: {
        1: [
            {value: 1, label: "Ręczne urządzenie resuscytacyjne"},
            {value: 2, label: "Urządzenie do podawania tlenu z zaworem redukcyjnym lub butla tlenowa"},
            {value: 3, label: "Mechaniczny aspirator do oczyszczania górnych dróg oddechowych"},
        ],

    }
}

export default constantsEquipment;
export const categories = [
  {
    label: "Home and Essentials",
    path: "home-and-essentials",
    subcategories: [
      {
        label: "Appliances",
        path: "appliances",
        child: [
          { label: "Cooking and Stoves", path: "cooking-and-stoves" },
          { label: "Small Appliances", path: "small-appliances" }
        ]
      },
      {
        label: "Hardware",
        path: "hardware",
        child: [
          { label: "Car Accessories", path: "car-accessories" },
          { label: "Gardening Tools", path: "gardening-tools" }
        ]
      },
      {
        label: "Living Room",
        path: "living-room",
        child: []
      },
      {
        label: "Kitchenware",
        path: "kitchenware",
        child: [
          {
            label: "Cookware",
            path: "cookware"
          },
          {
            label: "Dining",
            path: "dining"
          }
        ]
      },
      {
        label: "Plasticware",
        path: "plasticware",
        child: [
          {
            label: "Bathroom Essentials",
            path: "bathroom-essentials"
          },
          {
            label: "Storage & Organizer",
            path: "storage-and-organizer"
          }
        ]
      }
    ]
  },
  {
    label: "Home Care",
    path: "home-care",
    subcategories: [
      {
        label: "Cleaning Aids",
        path: "cleaning-aids",
        child: []
      },
      {
        label: "Disposables",
        path: "disposables",
        child: []
      }
    ]
  },
]
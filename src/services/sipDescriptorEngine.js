/**
 * Sip Descriptor Engine
 * Converts total sips and volume into relatable real-world comparison descriptors and graphic badges:
 * - Hamster's water dropper
 * - Toddler's sippy cup 👶🥤
 * - Teacup / Soda Can ☕
 * - Gym Shaker Bottle 🏋️
 * - Stanley Tumbler / Venti Coffee 🥤
 * - 2-Liter Jug 🧃
 * - 1-Gallon Milk Jug 🥛
 * - Warehouse Pallet of Water Bottles 📦💧
 */

export function getSipDescriptor(totalSips, volumeMl) {
  if (totalSips <= 3 || volumeMl < 60) {
    return {
      title: "A Hamster's Water Dropper",
      description: "Just a few tiny drops! System hydration is low.",
      emoji: "🐹💧",
      image: null,
      tier: "micro"
    };
  }

  if (totalSips <= 15 || volumeMl < 240) {
    return {
      title: "A Toddler's Sippy Cup",
      description: "You've drunk about as much water as a toddler's sippy cup so far today!",
      emoji: "👶🥤",
      image: "/assets/sippy_cup.jpg",
      tier: "sippy_cup"
    };
  }

  if (totalSips <= 30 || volumeMl < 450) {
    return {
      title: "A Standard Soda Can / Teacup",
      description: "Equal to a cozy cup of tea or a 12oz soda can.",
      emoji: "☕🥤",
      image: null,
      tier: "teacup"
    };
  }

  if (totalSips <= 55 || volumeMl < 850) {
    return {
      title: "A Gym Shaker Bottle",
      description: "You've powered through a full protein shaker bottle of water!",
      emoji: "🏋️‍♂️💧",
      image: null,
      tier: "shaker"
    };
  }

  if (totalSips <= 90 || volumeMl < 1400) {
    return {
      title: "A Venti Stanley Tumbler",
      description: "Drunk as much as a giant insulated tumbler full of ice water.",
      emoji: "🥤🧊",
      image: null,
      tier: "tumbler"
    };
  }

  if (totalSips <= 150 || volumeMl < 2500) {
    return {
      title: "A 2-Liter Soda Jug",
      description: "Over half a gallon! Equivalent to a massive 2-Liter bottle.",
      emoji: "🧃⚡",
      image: null,
      tier: "jug"
    };
  }

  if (totalSips <= 250 || volumeMl < 4000) {
    return {
      title: "A Full 1-Gallon Milk Jug",
      description: "A full gallon! Exceptional hydration champion status.",
      emoji: "🥛🏆",
      image: null,
      tier: "gallon"
    };
  }

  // > 4000 ml / 250+ sips -> Warehouse Pallet scale!
  return {
    title: "A Warehouse Pallet of Water Bottles",
    description: "Industrial scale hydration! You drank an entire pallet's worth of water bottles!",
    emoji: "📦💧",
    image: "/assets/water_pallet.jpg",
    tier: "pallet"
  };
}

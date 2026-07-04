// db/seed.js
// Populates the database with The House of Earthmonk's menu.
// Run once with: npm run seed
// Safe to re-run - it clears and reloads menu tables only (never touches
// bookings or messages customers have already sent).

const bcrypt = require('bcryptjs');
const db = require('./database');

const menu = {
  'Crafted With Love': [
    ['Coconut Lemonade', 'Coconut water, lemon, condensed milk.', 300, true],
    ['Color Of Mango', 'Mango juice, aam panna, house seasoning, soda.', 300, true],
    ['Electric Lemonade', 'Red Bull, lemonade, blue curacao.', 350, true],
    ['Hibiscus Orange Iced Tea', 'Hibiscus tea, orange juice, mint, ice water.', 300, true],
    ['Hibiscus Shikanji', 'Hibiscus, tea, lemon juice, simple syrup, black salt, chia seeds, soda.', 300, true],
    ['Imli Cola Punch', 'Imli cola, house seasoning.', 300, true],
    ['Kokum Ginger Cooler', 'Kokum syrup, ginger juice, lemon, soda.', 350, true],
    ['Orange Creamsicle', 'Orange, cream, condensed milk.', 350, true],
    ['Smoked Pineapple Salsa', 'Pineapple juice, jalapeno.', 300, true],
  ],
  'Fizzy': [
    ['Classic Virgin Mojito', '380ml', 260, true, true],
    ['Cranberry Mojito', '380ml', 260, true],
    ['Green Apple Mojito', '380ml', 260, true],
    ['Kiwi Mojito', '380ml', 260, true],
    ['Orange Mojito', '380ml', 260, true, true],
    ['Watermelon Mojito', '380ml', 260, true, true],
  ],
  'Iced Tea': [
    ['Cranberry Iced Tea', '230ml', 250, true],
    ['Lemon Iced Tea', '230ml', 250, true],
    ['Peach Iced Tea', '230ml', 250, true],
  ],
  'Hot Coffees': [
    ['Cafe Cubano', 'Espresso with brown sugar (70ml).', 220, true],
    ['Cappuccino', 'Espresso shot topped with hot milk and foam (240ml).', 220, true],
    ['Doppio', 'Double espresso shot (120ml).', 200, true],
    ['Espresso Shot', 'Single coffee shot (60ml).', 150, true],
    ['Macchiato', 'Strong espresso topped with foamed milk (100ml).', 220, true],
    ['Mochaccino', 'Espresso topped with frothy milk, finished with grated chocolate (240ml).', 240, true],
  ],
  'Cold Coffees': [
    ['Banoffee Coffee', 'Espresso blended with condensed milk, milk, banana puree, cookie crumble.', 260, true],
    ['Cold Coffee', 'Espresso whipped with ice, ice cream, milk, chocolate syrup.', 220, true],
    ['Iced Americano', 'Espresso topped with ice cubes and chilled water.', 150, true],
    ['Java Chip', 'Espresso blended with cream, milk and chocolate chip.', 260, true],
    ['Latte', 'Espresso topped with flat milk.', 220, true],
    ['Mocha', 'Espresso and melted chocolate, topped with chilled milk, finished with grated chocolate.', 240, true],
    ['Orange Coffee Soda', 'Espresso topped with orange juice and soda.', 180, true],
    ['Vietnamese Iced Coffee', 'Strong espresso and condensed milk over chilled ice.', 220, true],
  ],
  'Shake It Baby': [
    ['Belgium Chocolate Shake', '', 300, true],
    ['Biscoff Shake', '', 300, true],
    ['Ferrero Rocher Shake', '', 350, true],
    ['Kitkat Shake', '', 300, true],
    ['Oreo Shake', '', 300, true],
  ],
  'Basic Liquids': [
    ['Chilled Soda', '', 50, true],
    ['Fresh Lime Water', '', 150, true],
  ],
  'Soup': [
    ['Green Manchow Soup', 'Asian mirepoix in broth with generous green schezwan sauce.', 350, true],
    ['Hearty Broccoli Soup', 'Creamed butter seared broccoli, paired with garlic bread.', 320, true],
    ['Loaded Nachos Soup', 'Spicy chipotle smoked tomato soup topped with nachos, sour cream, jalapeno.', 350, true],
  ],
  'Salad': [
    ['Cilantro Caesar Salad', 'Assorted lettuce in creamy cilantro dressing with croutons and cherry tomato.', 300, true],
    ['Truffle Parmesan Veggie', 'Exotic vegetables tossed in butter garlic, finished with truffle oil and parmesan.', 350, true],
    ['Watermelon Feta Salad', 'Diced watermelon in balsamic dressing, crumbled feta and basil.', 300, true],
  ],
  'Global Small Plates': [
    ['Baked Burrata', '200g. Oven baked burrata in tomato-cream sauce, served with garlic bread.', 500, true, true],
    ['Crispy Tortellini', '5pc. Chopped tomato, pepper and nuts stuffed fried tortellini, cheddar sauce, chili oil.', 400, true],
    ['Hot Shots', '6pc. Golden-fried cottage cheese in a crunchy peanut-onion-garlic mix, smoky hot sauce.', 400, true],
    ['Hummus And Falafel', '200g. Creamy hummus topped with falafel and seasoned chickpea.', 450, true],
    ['K-Buns', '6pc. Butter garlic baked sweet cream cheese with mini butter garlic knots.', 450, true],
    ['Loaded Nachos', 'Crispy nachos, spicy bean sauce, cheese sauce, sour cream, salsa.', 450, true],
    ['Lotus Root Bhel', '180g. Crispy lotus root, chili lemon dressing, fried garlic and onion, peanut, scallion.', 450, true],
    ['Mango Habanero Popcorn Taco', '3pc. Cottage cheese popcorn, mango habanero sauce, pico de gallo.', 450, true],
    ['Mexican Jalapeno Cheese Balls', '250g, 6pc. Re-fried beans, jalapeno and cheese, cilantro sour cream.', 450, true],
  ],
  'Asian Tapas': [
    ['Chillies', 'Sweet and spicy sauce tossed peppers, onion, and base of your choice.', 400, true],
    ['Kung Pao Paneer', 'Crispy cottage cheese tossed in spicy kung pao sauce with peanuts and veggies.', 450, true],
    ['Stir Fried Noodles', 'Asian stir-fried vegetables with noodles in seasoning and choice of sauce.', 400, true],
  ],
  'Indian Small Plates': [
    ['Chilly Cheese Cafreal Tikka', '6pc. Chili and cheese stuffed paneer, Goan green chutney marination.', 500, true],
    ['Creamy Tandoori Broccoli', '6pc. Tandoor cooked marinated broccoli finished with cream.', 500, true],
    ['Karwari Paneer Tikka', '6pc. Spicy coconut cream marinated paneer, cooked in tandoor.', 500, true],
    ['Paneer 65 Quesadilla', '3pc. Crispy paneer 65 in a Malabar quesadilla shell, curry leaf mayo, onion.', 500, true],
    ['Surkh Paneer Ka Tikka', '6pc. Tandoor cooked paneer in spicy hung curd and chili marination.', 500, true],
    ['Tandoori Chaap', '6pc. Tandoor cooked soya chaap in spicy hung curd and chili marination.', 500, true],
  ],
  'Pizza': [
    ['Basil Fresh Pizza', 'Neapolitan base, marinara, fresh mozzarella, basil pesto, toasted cherry tomato, olives, basil.', 750, true],
    ['Diavola Pizza', 'Neapolitan base, marinara, red paprika, onion, jalapeno, green chilli, olives.', 750, true],
    ['Margarita Pizza', 'Neapolitan base, marinara, fresh mozzarella and basil.', 700, true],
    ['Quattro Formaggi Pizza', 'Neapolitan base, marinara, cream cheese, mozzarella, parmesan, cheddar.', 700, true],
    ['The Garden City Pizza', 'Neapolitan base, marinara, mozzarella, onion, bell pepper, broccoli, zucchini, corn, olive, basil.', 750, true],
    ['Truffled Mushroom Pizza', 'Truffle oil and mushroom sauce, mozzarella, rocket leaves, parmesan.', 700, true],
  ],
  'Pasta': [
    ['Arrabbiata', '', 650, true],
    ['Baked Lasagne', 'Lasagne sheet layered with arrabbiata sauce, cheese sauce and exotic vegetable.', 650, true, true],
    ['Caponata Ravioli', 'Fresh herbs, chopped pepper, tomato, nut-stuffed ravioli in tomato cream sauce.', 650, true],
    ['Fettuccini In Truffle Pepper Sauce', 'Creamy yellow pepper sauce, finished with truffle oil.', 650, true],
    ['Penne', '', 650, true],
    ['Rosa', '', 650, true],
    ['Smoked Chipotle Mac And Cheese', 'Macaroni in smoked chipotle infused cheese sauce.', 650, true],
    ['Spaghetti', '', 650, true],
  ],
  'Platters': [
    ['BBQ Platter', '3pc each of tandoori chaap, tandoori broccoli, cafreal tikka, surkh paneer tikka.', 900, true],
    ['Crostini Platter', '2pc each of creamy mushroom, pesto burrata, guacamole.', 750, true],
    ['Mexican Platter', 'Crispy tortilla, fries, guacamole, salsa, sour cream, cheese sauce, refried beans.', 900, true],
    ['Mezze Platter', 'Classic hummus, pesto hummus, baba ganoush, garlic sauce, fattoush, falafel, pita, pickled veg.', 900, true],
  ],
  'Global Big Plates': [
    ['California Sushi Bowl', 'Sushi rice, avocado cream cheese, pickled cucumber, veggies, wasabi mayo, edamame, nori, sesame.', 580, true],
    ['Corn And Spinach Stuffed Grilled Cottage Cheese Steak', 'Herbed butter rice, sundried tomato sauce.', 600, true],
    ['Mexican Hot Pot', 'Mexican chilli bean rice topped with curry, salsa, sour cream, cheese sauce, nachos.', 600, true],
    ['Schezwan Bibimbap Bowl', 'Schezwan fried rice, spicy grilled cottage cheese, cabbage, mushroom, cucumber, carrot.', 580, true],
    ['Shawarma Bowl', 'Cottage cheese shawarma rice, hummus, roasted veggies, avocado, seasoned chickpea.', 580, true],
    ['Thai Curry', 'Exotic vegetables in coconut Thai curry, steamed rice. Ask for red or green.', 600, true],
  ],
  'Indian Subjiyaan': [
    ['Baked Burrata Masala', '', 680, true],
    ['Chenna Kebab Curry', '', 520, true],
    ['Dal Makhani', '', 550, true],
    ['Dal Tadka', '', 480, true],
    ['Kolhapuri Mix Veg', '', 500, true],
    ['Paneer Ghee Roast Curry', '', 560, true],
    ['Paneer Labadar', '', 650, true],
    ['Paneer Makhani', '', 650, true],
    ['Paneer Maratha', '', 600, true],
    ['Paneer Tikka Masala', '', 650, true],
    ['Veg Handi', '', 500, true],
    ['Veg Jalfrezi', '', 500, true],
  ],
  'Naans': [
    ['Butter Naan', '', 120, true],
    ['Cheese Garlic Naan', '', 180, true],
    ['Hariyali Naan', '', 140, true],
    ['Masala Cheese Garlic Naan', '', 140, true],
    ['Masala Garlic Naan', '', 140, true],
    ['Peri Peri Masala Naan', '', 120, true],
  ],
  'Laccha Paratha': [
    ['Laccha Paratha', '', 150, true],
    ['Mirchi Pudina Laccha', '', 160, true],
    ['Sumac Laccha Paratha', '', 150, true],
    ['Zatar Laccha', '', 150, true],
  ],
  'Kulchas': [
    ['Aloo Kulcha', '', 150, true],
    ['Cheesy Pepper Kulcha', '', 180, true],
    ['Paneer Kulcha', '', 180, true],
  ],
  'Rotis': [
    ['Butter Roti', '', 70, true],
    ['Masala Roti', '', 80, true],
    ['Plain Roti', '', 60, true],
  ],
  'Rice': [
    ['Hyderabadi Biryani', '', 580, true],
    ['Jeera Rice', '', 300, true],
    ['Steamed Rice', '', 280, true],
    ['Veg Dum Biryani', '', 580, true],
    ['Vegetable Masala Khichdi', '', 430, true],
  ],
  'Sides': [
    ['Cheesy Garlic Bread', '5pc oven baked cheesy garlic bread.', 370, true],
    ['Fried Papad', '', 60, true],
    ['Fries', '', 200, true],
    ['Garlic Bread', '5pc oven baked garlic butter bread.', 300, true],
    ['Masala Papad', '', 90, true],
    ['Plain Curd', '', 100, true],
    ['Roasted Papad', '', 50, true],
    ['Veg Raita', '', 150, true],
  ],
  'Dessert': [
    ['Blueberry Cheesecake', '', 350, true],
    ['Sizzling Brownie', '', 300, true, true],
  ],
};

function seed() {
  const insertCategory = db.prepare(
    'INSERT INTO menu_categories (name, sort_order) VALUES (?, ?)'
  );
  const insertItem = db.prepare(`
    INSERT INTO menu_items (category_id, name, description, price, veg, popular, sort_order)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const wipe = db.transaction(() => {
    db.exec('DELETE FROM menu_items; DELETE FROM menu_categories;');

    let catOrder = 0;
    for (const [categoryName, items] of Object.entries(menu)) {
      const { lastInsertRowid: categoryId } = insertCategory.run(categoryName, catOrder++);
      let itemOrder = 0;
      for (const [name, description, price, veg, popular] of items) {
        insertItem.run(categoryId, name, description || '', price, veg ? 1 : 0, popular ? 1 : 0, itemOrder++);
      }
    }
  });

  wipe();
  console.log(`Seeded ${Object.keys(menu).length} categories.`);

  // Helpful one-time reminder about the admin password.
  console.log('\nReminder: set ADMIN_USERNAME and ADMIN_PASSWORD_HASH in your .env file.');
  console.log('Generate a hash with: node scripts/hash-password.js "YourNewPassword123!"');
}

seed();

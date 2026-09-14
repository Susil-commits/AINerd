"""
Curated Common Core Math Problems
Provides high-fidelity, pedagogically structured problems for the 10 Common Core math skills.
Guarantees coverage across difficulties 1 to 5 with explicit step-by-step solutions.
"""

CURATED_STANDARDS_PROBLEMS = [
    # =========================================================================
    # 3.OA.A.1 - Understanding Multiplication
    # =========================================================================
    {
        "title": "Crayon Boxes",
        "text": "A teacher bought 6 boxes of crayons. Each box contains 8 crayons. How many crayons are there in all?",
        "skill_id": "3.OA.A.1",
        "difficulty": 1,
        "expected_steps": [
            "Identify equal groups: 6 groups of 8 crayons",
            "Write multiplication equation: 6 × 8 = ?",
            "Calculate: 6 × 8 = 48",
            "Answer: There are 48 crayons in all"
        ],
        "source": "hand_curated"
    },
    {
        "title": "Garden Tomato Rows",
        "text": "Maria planted 4 rows of tomato plants. Each row has 9 plants. How many tomato plants did Maria plant?",
        "skill_id": "3.OA.A.1",
        "difficulty": 1,
        "expected_steps": [
            "Identify equal groups: 4 rows of 9 plants",
            "Write equation: 4 × 9 = ?",
            "Calculate: 4 × 9 = 36",
            "Answer: Maria planted 36 tomato plants"
        ],
        "source": "hand_curated"
    },
    {
        "title": "Bakery Cupcake Trays",
        "text": "A baker arranges cupcakes in 7 rows with 6 cupcakes in each row. How many cupcakes are on the tray?",
        "skill_id": "3.OA.A.1",
        "difficulty": 2,
        "expected_steps": [
            "Model as an array: 7 rows by 6 columns",
            "Write equation: 7 × 6 = ?",
            "Calculate: 7 × 6 = 42",
            "Answer: There are 42 cupcakes on the tray"
        ],
        "source": "hand_curated"
    },
    {
        "title": "Library Bookshelves",
        "text": "The school library has 8 shelves. Each shelf holds 12 mystery books. How many mystery books are in the library?",
        "skill_id": "3.OA.A.1",
        "difficulty": 2,
        "expected_steps": [
            "Identify groups: 8 shelves with 12 books each",
            "Break apart 12: 8 × (10 + 2) = (8 × 10) + (8 × 2)",
            "Calculate: 80 + 16 = 96",
            "Answer: There are 96 mystery books"
        ],
        "source": "hand_curated"
    },
    {
        "title": "Soccer Team Jerseys",
        "text": "A youth soccer league has 9 teams. Each team has 14 players. How many players need jerseys?",
        "skill_id": "3.OA.A.1",
        "difficulty": 3,
        "expected_steps": [
            "Set up multiplication: 9 × 14",
            "Use distributive property: 9 × (10 + 4) = 90 + 36",
            "Add: 90 + 36 = 126",
            "Answer: 126 players need jerseys"
        ],
        "source": "hand_curated"
    },
    {
        "title": "Toy Car Wheels",
        "text": "A factory produces toy cars. Each car needs 4 wheels. If the factory builds 25 cars in the morning and 15 in the afternoon, how many total wheels are needed?",
        "skill_id": "3.OA.A.1",
        "difficulty": 3,
        "expected_steps": [
            "Find total cars: 25 + 15 = 40 cars",
            "Multiply by wheels per car: 40 × 4 = 160",
            "Answer: 160 wheels are needed"
        ],
        "source": "hand_curated"
    },
    {
        "title": "Tile Floor Pattern",
        "text": "A patio is covered with square tiles. It has 16 rows of tiles with 8 tiles in each row. A walkway next to it has 4 rows of 8 tiles. How many tiles are there altogether?",
        "skill_id": "3.OA.A.1",
        "difficulty": 4,
        "expected_steps": [
            "Combine rows with same width: 16 + 4 = 20 rows of 8 tiles",
            "Multiply: 20 × 8 = 160",
            "Check via separate areas: (16 × 8) + (4 × 8) = 128 + 32 = 160",
            "Answer: There are 160 tiles altogether"
        ],
        "source": "hand_curated"
    },
    {
        "title": "Orchard Fruit Harvest",
        "text": "An apple orchard has 12 rows of trees with 15 trees in each row. Each tree yields 8 bushels of apples. How many bushels are harvested from the orchard?",
        "skill_id": "3.OA.A.1",
        "difficulty": 5,
        "expected_steps": [
            "Find total trees: 12 × 15 = 180 trees",
            "Multiply total trees by bushels per tree: 180 × 8",
            "Calculate: (180 × 8) = (100 × 8) + (80 × 8) = 800 + 640 = 1440",
            "Answer: 1,440 bushels of apples are harvested"
        ],
        "source": "hand_curated"
    },

    # =========================================================================
    # 3.OA.A.2 - Understanding Division
    # =========================================================================
    {
        "title": "Marble Sharing",
        "text": "Leo has 35 marbles and divides them equally into 5 bags. How many marbles are in each bag?",
        "skill_id": "3.OA.A.2",
        "difficulty": 1,
        "expected_steps": [
            "Identify division operation: equal partition 35 ÷ 5",
            "Think multiplication: 5 × ? = 35",
            "Calculate: 35 ÷ 5 = 7",
            "Answer: Each bag has 7 marbles"
        ],
        "source": "hand_curated"
    },
    {
        "title": "Seating at the Diner",
        "text": "A diner has 48 chairs. The manager arranges them so that 6 chairs are at each table. How many tables are there?",
        "skill_id": "3.OA.A.2",
        "difficulty": 1,
        "expected_steps": [
            "Identify division operation: total items ÷ items per group = 48 ÷ 6",
            "Calculate: 48 ÷ 6 = 8",
            "Answer: There are 8 tables"
        ],
        "source": "hand_curated"
    },
    {
        "title": "Packing Tennis Balls",
        "text": "A sports shop has 72 tennis balls. They pack them into cans of 3 balls each. How many cans can they fill?",
        "skill_id": "3.OA.A.2",
        "difficulty": 2,
        "expected_steps": [
            "Set up equation: 72 ÷ 3 = ?",
            "Break down 72: (60 ÷ 3) + (12 ÷ 3)",
            "Calculate: 20 + 4 = 24",
            "Answer: They can fill 24 cans"
        ],
        "source": "hand_curated"
    },
    {
        "title": "Ribbon Bows",
        "text": "Hannah has 96 inches of ribbon. She cuts it into pieces that are each 8 inches long to make bows. How many bows can she make?",
        "skill_id": "3.OA.A.2",
        "difficulty": 2,
        "expected_steps": [
            "Identify operation: 96 ÷ 8",
            "Calculate: 8 × 12 = 96, so 96 ÷ 8 = 12",
            "Answer: Hannah can make 12 bows"
        ],
        "source": "hand_curated"
    },
    {
        "title": "School Bus Seating",
        "text": "There are 108 students going on a field trip. Each bus can safely seat 36 students. How many buses are needed?",
        "skill_id": "3.OA.A.2",
        "difficulty": 3,
        "expected_steps": [
            "Set up division: 108 ÷ 36",
            "Estimate: 36 × 3 = 108",
            "Calculate: 108 ÷ 36 = 3",
            "Answer: Exactly 3 buses are needed"
        ],
        "source": "hand_curated"
    },
    {
        "title": "Art Class Supplies",
        "text": "An art teacher has 144 paintbrushes. She wants to divide them equally among 12 table stations. How many brushes will each table receive?",
        "skill_id": "3.OA.A.2",
        "difficulty": 3,
        "expected_steps": [
            "Set up division: 144 ÷ 12",
            "Recall basic facts: 12 × 12 = 144",
            "Answer: Each table receives 12 paintbrushes"
        ],
        "source": "hand_curated"
    },
    {
        "title": "Pencil Factory Boxing",
        "text": "A warehouse has 320 colored pencils. They pack 24 pencils into standard boxes. How many full boxes can they pack, and how many pencils remain?",
        "skill_id": "3.OA.A.2",
        "difficulty": 4,
        "expected_steps": [
            "Divide 320 by 24: 320 ÷ 24",
            "24 × 10 = 240; 320 - 240 = 80",
            "24 × 3 = 72; 80 - 72 = 8",
            "Quotient is 13 with a remainder of 8",
            "Answer: 13 full boxes with 8 pencils left over"
        ],
        "source": "hand_curated"
    },
    {
        "title": "Festival Ticket Distribution",
        "text": "A school festival has 525 tickets to distribute equally among 15 classrooms. If 2 classrooms decline tickets, how many tickets will each of the remaining classrooms get?",
        "skill_id": "3.OA.A.2",
        "difficulty": 5,
        "expected_steps": [
            "Calculate remaining classrooms: 15 - 2 = 13 classrooms",
            "Divide 525 by 13 or check: 15 original classrooms received 525 ÷ 15 = 35",
            "Redistribute 525 across 13 classrooms: 525 ÷ 13 = 40 R5",
            "Answer: Each classroom gets 40 tickets, with 5 tickets left over"
        ],
        "source": "hand_curated"
    },

    # =========================================================================
    # 3.OA.D.8 - Solving Two-Step Word Problems
    # =========================================================================
    {
        "title": "Carnival Ride Tickets",
        "text": "Sam had 30 ride tickets. He gave 12 tickets to his sister and then bought 15 more tickets. How many tickets does Sam have now?",
        "skill_id": "3.OA.D.8",
        "difficulty": 1,
        "expected_steps": [
            "Step 1: Subtract tickets given away: 30 - 12 = 18",
            "Step 2: Add newly bought tickets: 18 + 15 = 33",
            "Answer: Sam has 33 tickets now"
        ],
        "source": "hand_curated"
    },
    {
        "title": "Movie Snack Bar",
        "text": "Popcorn costs $6 and a drink costs $3. Maya bought 2 bags of popcorn and 1 drink. She paid with a $20 bill. How much change did she get?",
        "skill_id": "3.OA.D.8",
        "difficulty": 2,
        "expected_steps": [
            "Step 1: Find total cost of snacks: (2 × $6) + $3 = $12 + $3 = $15",
            "Step 2: Subtract cost from amount paid: $20 - $15 = $5",
            "Answer: Maya received $5 in change"
        ],
        "source": "hand_curated"
    },
    {
        "title": "Farmer's Market Apples",
        "text": "A farmer harvested 50 kg of apples. She sold 18 kg in the morning and 22 kg in the afternoon. She packed the remaining apples into 2 equal crates. How many kg are in each crate?",
        "skill_id": "3.OA.D.8",
        "difficulty": 3,
        "expected_steps": [
            "Step 1: Total sold: 18 + 22 = 40 kg",
            "Step 2: Remaining apples: 50 - 40 = 10 kg",
            "Step 3: Divide into 2 crates: 10 ÷ 2 = 5 kg",
            "Answer: Each crate contains 5 kg of apples"
        ],
        "source": "hand_curated"
    },
    {
        "title": "Book Sale Savings",
        "text": "Marcus earns $8 each time he mows a lawn. He mowed 5 lawns this week. He then bought a video game for $25. How much money does he have left?",
        "skill_id": "3.OA.D.8",
        "difficulty": 3,
        "expected_steps": [
            "Step 1: Calculate earnings: 5 × $8 = $40",
            "Step 2: Deduct cost of game: $40 - $25 = $15",
            "Answer: Marcus has $15 left"
        ],
        "source": "hand_curated"
    },
    {
        "title": "School Fundraiser T-Shirts",
        "text": "A club ordered 8 boxes of t-shirts with 12 shirts per box. They sold 65 shirts on Friday and 20 shirts on Saturday. How many shirts are still unsold?",
        "skill_id": "3.OA.D.8",
        "difficulty": 4,
        "expected_steps": [
            "Step 1: Calculate total shirts ordered: 8 × 12 = 96",
            "Step 2: Calculate total shirts sold: 65 + 20 = 85",
            "Step 3: Subtract sold from total: 96 - 85 = 11",
            "Answer: 11 shirts are still unsold"
        ],
        "source": "hand_curated"
    },
    {
        "title": "Baking Championship Batches",
        "text": "Elena baked 6 dozen chocolate cookies and 4 dozen vanilla cookies. She set aside 18 cookies for a tasting panel and distributed the rest evenly into 6 party platters. How many cookies were on each platter?",
        "skill_id": "3.OA.D.8",
        "difficulty": 5,
        "expected_steps": [
            "Step 1: Convert dozens to total cookies: (6 + 4) × 12 = 10 × 12 = 120 cookies",
            "Step 2: Subtract tasting panel cookies: 120 - 18 = 102 cookies",
            "Step 3: Divide evenly onto 6 platters: 102 ÷ 6 = 17 cookies",
            "Answer: There were 17 cookies on each platter"
        ],
        "source": "hand_curated"
    },

    # =========================================================================
    # 4.NF.A.1 - Equivalent Fractions
    # =========================================================================
    {
        "title": "Equivalent Fractions: Halves to Eighths",
        "text": "Find the missing numerator: 1/2 = ?/8. What number completes the statement?",
        "skill_id": "4.NF.A.1",
        "difficulty": 1,
        "expected_steps": [
            "Find multiplier for denominator: 2 × 4 = 8",
            "Multiply numerator by same number: 1 × 4 = 4",
            "Answer: 1/2 = 4/8, so the missing number is 4"
        ],
        "source": "hand_curated"
    },
    {
        "title": "Equivalent Fractions: Thirds to Ninths",
        "text": "Fill in the blank to make the fractions equivalent: 2/3 = ?/9.",
        "skill_id": "4.NF.A.1",
        "difficulty": 1,
        "expected_steps": [
            "Determine the factor: 3 × 3 = 9",
            "Multiply the numerator: 2 × 3 = 6",
            "Answer: 2/3 = 6/9, so the missing number is 6"
        ],
        "source": "hand_curated"
    },
    {
        "title": "Simplifying Six-Tenths",
        "text": "Simplify the fraction 6/10 to its simplest form by dividing numerator and denominator by their greatest common factor.",
        "skill_id": "4.NF.A.1",
        "difficulty": 2,
        "expected_steps": [
            "Find greatest common factor of 6 and 10: GCF is 2",
            "Divide numerator: 6 ÷ 2 = 3",
            "Divide denominator: 10 ÷ 2 = 5",
            "Answer: 6/10 in simplest form is 3/5"
        ],
        "source": "hand_curated"
    },
    {
        "title": "Equivalent Fraction Matching",
        "text": "Which fraction is equivalent to 3/4? A) 6/10  B) 9/12  C) 8/12  D) 5/8. Show your calculation.",
        "skill_id": "4.NF.A.1",
        "difficulty": 2,
        "expected_steps": [
            "Check multiplier for 3/4 with denominator 12: 4 × 3 = 12",
            "Multiply numerator by 3: 3 × 3 = 9",
            "Verify: 3/4 = 9/12",
            "Answer: B) 9/12 is equivalent to 3/4"
        ],
        "source": "hand_curated"
    },
    {
        "title": "Simplifying 18/24",
        "text": "Express 18/24 in simplest form. Explain how you simplified it.",
        "skill_id": "4.NF.A.1",
        "difficulty": 3,
        "expected_steps": [
            "Find common factors of 18 and 24: 1, 2, 3, 6 (GCF = 6)",
            "Divide numerator by 6: 18 ÷ 6 = 3",
            "Divide denominator by 6: 24 ÷ 6 = 4",
            "Answer: The fraction in simplest form is 3/4"
        ],
        "source": "hand_curated"
    },
    {
        "title": "Comparing Fractions with Common Denominators",
        "text": "Convert 3/5 and 2/3 into equivalent fractions with a common denominator of 15. Which fraction is larger?",
        "skill_id": "4.NF.A.1",
        "difficulty": 3,
        "expected_steps": [
            "Convert 3/5: multiply top and bottom by 3 → (3×3)/(5×3) = 9/15",
            "Convert 2/3: multiply top and bottom by 5 → (2×5)/(3×5) = 10/15",
            "Compare numerators: 10 > 9, so 10/15 > 9/15",
            "Answer: 2/3 (or 10/15) is larger than 3/5"
        ],
        "source": "hand_curated"
    },
    {
        "title": "Baker's Measuring Cup Puzzle",
        "text": "A chef's recipe calls for 6/8 cup of olive oil, but the measuring spoon only measures in fourths. How many fourths of a cup should the chef use?",
        "skill_id": "4.NF.A.1",
        "difficulty": 4,
        "expected_steps": [
            "Set up equivalence: 6/8 = ?/4",
            "Find division factor: 8 ÷ 2 = 4",
            "Divide numerator by 2: 6 ÷ 2 = 3",
            "Answer: The chef should use 3 fourths (3/4) cup of olive oil"
        ],
        "source": "hand_curated"
    },
    {
        "title": "Three-Way Fraction Equivalence",
        "text": "Find the values of a and b that make this chain true: 4/5 = a/20 = 28/b.",
        "skill_id": "4.NF.A.1",
        "difficulty": 5,
        "expected_steps": [
            "Solve for a: 4/5 = a/20 → factor is 20 ÷ 5 = 4 → a = 4 × 4 = 16",
            "Solve for b: 4/5 = 28/b → factor is 28 ÷ 4 = 7 → b = 5 × 7 = 35",
            "Check: 4/5 = 16/20 = 28/35 = 0.8 ✓",
            "Answer: a = 16 and b = 35"
        ],
        "source": "hand_curated"
    },

    # =========================================================================
    # 4.NF.B.3 - Adding and Subtracting Fractions
    # =========================================================================
    {
        "title": "Pie Slices Addition",
        "text": "Julia ate 2/6 of a cherry pie and Liam ate 3/6 of the same pie. What fraction of the pie was eaten altogether?",
        "skill_id": "4.NF.B.3",
        "difficulty": 1,
        "expected_steps": [
            "Notice denominators are equal (both 6)",
            "Add numerators: 2 + 3 = 5",
            "Keep common denominator: 5/6",
            "Answer: 5/6 of the pie was eaten"
        ],
        "source": "hand_curated"
    },
    {
        "title": "Juice Pitcher Subtraction",
        "text": "A pitcher was 7/10 full of lemonade. After lunch, 3/10 of the pitcher had been poured out. How much lemonade is left?",
        "skill_id": "4.NF.B.3",
        "difficulty": 1,
        "expected_steps": [
            "Notice denominators are equal (10)",
            "Subtract numerators: 7 - 3 = 4",
            "Write result: 4/10 (or simplified to 2/5)",
            "Answer: 4/10 (or 2/5) of the pitcher remains"
        ],
        "source": "hand_curated"
    },
    {
        "title": "Walking Trails: Unlike Denominators",
        "text": "Devon walked 1/2 mile along the river trail and then 1/4 mile through the woods. How far did Devon walk in total?",
        "skill_id": "4.NF.B.3",
        "difficulty": 2,
        "expected_steps": [
            "Find common denominator for 2 and 4: LCD = 4",
            "Convert 1/2 to fourths: 1/2 = 2/4",
            "Add the fractions: 2/4 + 1/4 = 3/4",
            "Answer: Devon walked 3/4 mile in total"
        ],
        "source": "hand_curated"
    },
    {
        "title": "Lumber Plank Cutting",
        "text": "A carpenter had a board that was 5/6 meter long. He cut off a piece measuring 1/2 meter. How long is the remaining piece?",
        "skill_id": "4.NF.B.3",
        "difficulty": 2,
        "expected_steps": [
            "Find LCD for 6 and 2: LCD is 6",
            "Convert 1/2 to sixths: 1/2 = 3/6",
            "Subtract: 5/6 - 3/6 = 2/6",
            "Simplify: 2/6 = 1/3",
            "Answer: The remaining board is 1/3 meter long"
        ],
        "source": "hand_curated"
    },
    {
        "title": "Flour Jar Addition: Fifths and Thirds",
        "text": "A baker adds 2/3 cup of whole wheat flour and 1/5 cup of rye flour to a bowl. How much total flour was added?",
        "skill_id": "4.NF.B.3",
        "difficulty": 3,
        "expected_steps": [
            "Find LCD of 3 and 5: 3 × 5 = 15",
            "Convert 2/3: (2×5)/(3×5) = 10/15",
            "Convert 1/5: (1×3)/(5×3) = 3/15",
            "Add: 10/15 + 3/15 = 13/15",
            "Answer: Total flour added is 13/15 cup"
        ],
        "source": "hand_curated"
    },
    {
        "title": "Mixed Number Milk Usage",
        "text": "A recipe uses 2 1/4 cups of milk. Noah has 3 3/4 cups. How much milk will Noah have left after making the recipe?",
        "skill_id": "4.NF.B.3",
        "difficulty": 3,
        "expected_steps": [
            "Subtract whole numbers: 3 - 2 = 1",
            "Subtract fractional parts: 3/4 - 1/4 = 2/4 = 1/2",
            "Combine: 1 + 1/2 = 1 1/2",
            "Answer: Noah has 1 1/2 cups of milk left"
        ],
        "source": "hand_curated"
    },
    {
        "title": "Subtracting with Regrouping",
        "text": "Calculate: 4 1/6 - 1 5/6. Show each step including regrouping.",
        "skill_id": "4.NF.B.3",
        "difficulty": 4,
        "expected_steps": [
            "Notice 1/6 < 5/6, so regroup from 4: 4 1/6 = 3 + (1 + 1/6) = 3 7/6",
            "Subtract whole numbers: 3 - 1 = 2",
            "Subtract fractions: 7/6 - 5/6 = 2/6 = 1/3",
            "Combine: 2 1/3",
            "Answer: 2 1/3"
        ],
        "source": "hand_curated"
    },
    {
        "title": "Three Fraction Triathalon",
        "text": "An athlete completed 3 legs of a race: 3/8 mile swimming, 1 1/2 miles cycling, and 3/4 mile running. What was the total race distance as a mixed number in simplest form?",
        "skill_id": "4.NF.B.3",
        "difficulty": 5,
        "expected_steps": [
            "Find common denominator for 8, 2, and 4: LCD = 8",
            "Convert fractions: 3/8 = 3/8, 1/2 = 4/8, 3/4 = 6/8",
            "Add fractional parts: 3/8 + 4/8 + 6/8 = 13/8 = 1 5/8",
            "Add whole number part: 1 + 1 5/8 = 2 5/8",
            "Answer: Total race distance is 2 5/8 miles"
        ],
        "source": "hand_curated"
    },

    # =========================================================================
    # 4.NF.B.4 - Multiplying Fractions by Whole Numbers
    # =========================================================================
    {
        "title": "Repeated Fraction: Cupcake Sprinkles",
        "text": "Each cupcake needs 1/4 teaspoon of sprinkles. If Zoe makes 5 cupcakes, how many teaspoons of sprinkles does she need?",
        "skill_id": "4.NF.B.4",
        "difficulty": 1,
        "expected_steps": [
            "Write multiplication equation: 5 × 1/4",
            "Multiply whole number by numerator: (5 × 1) / 4 = 5/4",
            "Convert to mixed number: 5/4 = 1 1/4",
            "Answer: Zoe needs 1 1/4 teaspoons of sprinkles"
        ],
        "source": "hand_curated"
    },
    {
        "title": "Dog Food Portions",
        "text": "A puppy eats 2/3 cup of food at each meal. If the puppy is fed 2 times a day, how much food does it eat per day?",
        "skill_id": "4.NF.B.4",
        "difficulty": 1,
        "expected_steps": [
            "Multiply whole number by fraction: 2 × 2/3",
            "Multiply: (2 × 2) / 3 = 4/3",
            "Convert to mixed number: 4/3 = 1 1/3 cups",
            "Answer: The puppy eats 1 1/3 cups of food per day"
        ],
        "source": "hand_curated"
    },
    {
        "title": "Ribbon for Gift Packages",
        "text": "Each gift package requires 3/5 meter of shiny ribbon. How many meters of ribbon are needed to wrap 6 identical packages?",
        "skill_id": "4.NF.B.4",
        "difficulty": 2,
        "expected_steps": [
            "Set up multiplication: 6 × 3/5",
            "Multiply: (6 × 3) / 5 = 18/5",
            "Convert to mixed number: 18 ÷ 5 = 3 with remainder 3 → 3 3/5",
            "Answer: 3 3/5 meters of ribbon are needed"
        ],
        "source": "hand_curated"
    },
    {
        "title": "Classroom Fraction of a Whole",
        "text": "There are 28 students in a fifth-grade class. 3/4 of the students play a musical instrument. How many students play an instrument?",
        "skill_id": "4.NF.B.4",
        "difficulty": 2,
        "expected_steps": [
            "Set up multiplication: 28 × 3/4",
            "Divide by denominator first: 28 ÷ 4 = 7",
            "Multiply by numerator: 7 × 3 = 21",
            "Answer: 21 students play a musical instrument"
        ],
        "source": "hand_curated"
    },
    {
        "title": "Fuel Tank Capacity",
        "text": "A car's fuel tank holds 60 liters when completely full. The gauge currently shows 5/12 full. How many liters of gasoline are in the tank?",
        "skill_id": "4.NF.B.4",
        "difficulty": 3,
        "expected_steps": [
            "Calculate 5/12 of 60: 60 × (5/12)",
            "Simplify 60 ÷ 12 = 5",
            "Multiply: 5 × 5 = 25",
            "Answer: There are 25 liters of gasoline in the tank"
        ],
        "source": "hand_curated"
    },
    {
        "title": "Running Laps Around the Track",
        "text": "One lap around the school track is 3/8 of a kilometer. Coach Rivera ran 10 laps during practice. How many kilometers did he run?",
        "skill_id": "4.NF.B.4",
        "difficulty": 3,
        "expected_steps": [
            "Multiply: 10 × 3/8 = 30/8",
            "Simplify fraction: 30/8 = 15/4",
            "Convert to mixed number: 15 ÷ 4 = 3 3/4",
            "Answer: Coach Rivera ran 3 3/4 kilometers"
        ],
        "source": "hand_curated"
    },
    {
        "title": "Soup Kitchen Multi-Batch Cooking",
        "text": "A large batch of vegetable soup requires 2 3/4 cups of chopped carrots. A chef needs to cook 4 batches. How many total cups of carrots are required?",
        "skill_id": "4.NF.B.4",
        "difficulty": 4,
        "expected_steps": [
            "Convert mixed number to improper fraction: 2 3/4 = (2×4 + 3)/4 = 11/4",
            "Multiply by 4 batches: 4 × 11/4",
            "Cancel 4 in numerator and denominator: 11",
            "Answer: Exactly 11 cups of carrots are required"
        ],
        "source": "hand_curated"
    },
    {
        "title": "Community Garden Soil Allocation",
        "text": "A truck delivers 75 bags of potting soil. The community garden committee assigns 2/5 of the bags to vegetable beds, 1/3 of the total to flower beds, and saves the rest in storage. How many bags are saved in storage?",
        "skill_id": "4.NF.B.4",
        "difficulty": 5,
        "expected_steps": [
            "Calculate vegetable allocation: 75 × 2/5 = (75 ÷ 5) × 2 = 15 × 2 = 30 bags",
            "Calculate flower allocation: 75 × 1/3 = 75 ÷ 3 = 25 bags",
            "Sum used bags: 30 + 25 = 55 bags",
            "Subtract from total: 75 - 55 = 20 bags",
            "Answer: 20 bags of soil are saved in storage"
        ],
        "source": "hand_curated"
    },

    # =========================================================================
    # 5.NF.B.7 - Dividing Fractions
    # =========================================================================
    {
        "title": "Granola Bar Sharing",
        "text": "Divide 3 granola bars equally among 4 friends. What fraction of a granola bar does each friend receive?",
        "skill_id": "5.NF.B.7",
        "difficulty": 1,
        "expected_steps": [
            "Identify division: 3 bars divided by 4 friends = 3 ÷ 4",
            "Write division as a fraction: 3/4",
            "Answer: Each friend receives 3/4 of a granola bar"
        ],
        "source": "hand_curated"
    },
    {
        "title": "Sharing a Unit Fraction",
        "text": "Half (1/2) of a pan of brownies is left. 3 siblings want to share it equally. What fraction of the original pan does each sibling get?",
        "skill_id": "5.NF.B.7",
        "difficulty": 1,
        "expected_steps": [
            "Set up division: 1/2 ÷ 3",
            "Multiply by the reciprocal of 3 (which is 1/3): 1/2 × 1/3",
            "Multiply numerators and denominators: (1×1)/(2×3) = 1/6",
            "Answer: Each sibling gets 1/6 of the original pan"
        ],
        "source": "hand_curated"
    },
    {
        "title": "Measuring Scoops of Flour",
        "text": "A jar holds 4 cups of sugar. A recipe scoop holds 1/3 cup. How many scoops of sugar can be taken from the jar?",
        "skill_id": "5.NF.B.7",
        "difficulty": 2,
        "expected_steps": [
            "Set up division: 4 ÷ (1/3)",
            "Multiply by reciprocal of 1/3: 4 × 3/1",
            "Calculate: 4 × 3 = 12",
            "Answer: 12 scoops can be taken from the jar"
        ],
        "source": "hand_curated"
    },
    {
        "title": "Dividing Rope Lengths",
        "text": "A jump rope is 1/4 of a meter long. It is cut into 2 equal pieces. How long is each piece in meters?",
        "skill_id": "5.NF.B.7",
        "difficulty": 2,
        "expected_steps": [
            "Divide fraction by whole: 1/4 ÷ 2",
            "Multiply by reciprocal: 1/4 × 1/2 = 1/8",
            "Answer: Each piece is 1/8 of a meter long"
        ],
        "source": "hand_curated"
    },
    {
        "title": "Dividing Whole Number by Non-Unit Fraction",
        "text": "Calculate: 6 ÷ (2/3). Show how to multiply by the reciprocal.",
        "skill_id": "5.NF.B.7",
        "difficulty": 3,
        "expected_steps": [
            "Recall division rule: dividing by a/b is multiplying by b/a",
            "Reciprocal of 2/3 is 3/2",
            "Rewrite: 6 × 3/2",
            "Multiply: (6 × 3) / 2 = 18 / 2 = 9",
            "Answer: 9"
        ],
        "source": "hand_curated"
    },
    {
        "title": "Pancake Batter Portions",
        "text": "A chef has 5 cups of pancake batter. Each pancake requires 3/8 cup of batter. How many whole pancakes can the chef make?",
        "skill_id": "5.NF.B.7",
        "difficulty": 3,
        "expected_steps": [
            "Set up division: 5 ÷ 3/8",
            "Multiply by reciprocal: 5 × 8/3 = 40/3",
            "Convert to mixed number: 40 ÷ 3 = 13 1/3",
            "Identify whole pancakes: 13",
            "Answer: The chef can make 13 whole pancakes (with 1/3 cup batter left)"
        ],
        "source": "hand_curated"
    },
    {
        "title": "Dividing Fraction by Fraction",
        "text": "Evaluate: (3/4) ÷ (1/8). Explain the result using a model of eighths inside three-fourths.",
        "skill_id": "5.NF.B.7",
        "difficulty": 4,
        "expected_steps": [
            "Multiply by reciprocal: (3/4) × (8/1)",
            "Cross-simplify 4 and 8: 8 ÷ 4 = 2",
            "Multiply: 3 × 2 = 6",
            "Conceptual check: 3/4 = 6/8, and there are 6 eighths in 6/8",
            "Answer: 6"
        ],
        "source": "hand_curated"
    },
    {
        "title": "Hiking Trail Marker Intervals",
        "text": "A scenic trail is 4 1/2 kilometers long. Park rangers want to place safety call-boxes every 3/4 kilometer, starting at 3/4 km and ending at the finish line. How many call-boxes will be installed?",
        "skill_id": "5.NF.B.7",
        "difficulty": 5,
        "expected_steps": [
            "Convert 4 1/2 to improper fraction: 4 1/2 = 9/2",
            "Set up division: (9/2) ÷ (3/4)",
            "Multiply by reciprocal: (9/2) × (4/3)",
            "Simplify factors: (9 ÷ 3) × (4 ÷ 2) = 3 × 2 = 6",
            "Answer: Exactly 6 call-boxes will be installed"
        ],
        "source": "hand_curated"
    },

    # =========================================================================
    # 6.EE.A.2 - Writing and Reading Algebraic Expressions
    # =========================================================================
    {
        "title": "Translating Sums into Algebra",
        "text": "Write an algebraic expression for the phrase: '7 more than a number n'.",
        "skill_id": "6.EE.A.2",
        "difficulty": 1,
        "expected_steps": [
            "Identify the variable: n",
            "Identify the operation: 'more than' indicates addition",
            "Write the expression: n + 7",
            "Answer: n + 7"
        ],
        "source": "hand_curated"
    },
    {
        "title": "Translating Differences into Algebra",
        "text": "Write an algebraic expression for: 'the difference of a number y and 12'.",
        "skill_id": "6.EE.A.2",
        "difficulty": 1,
        "expected_steps": [
            "Identify the variable: y",
            "'Difference of y and 12' means subtract 12 from y",
            "Write expression: y - 12",
            "Answer: y - 12"
        ],
        "source": "hand_curated"
    },
    {
        "title": "Two-Part Expression: Ticket Prices",
        "text": "At an amusement park, admission costs $15 plus $4 for every ride ticket t. Write an algebraic expression for the total cost of admission with t ride tickets.",
        "skill_id": "6.EE.A.2",
        "difficulty": 2,
        "expected_steps": [
            "Admission is a fixed term: 15",
            "Ride cost is 4 times number of tickets t: 4t",
            "Combine terms into total cost: 15 + 4t (or 4t + 15)",
            "Answer: 15 + 4t"
        ],
        "source": "hand_curated"
    },
    {
        "title": "Translating Products and Sums",
        "text": "Write an algebraic expression for: 'five times the sum of a number x and 3'.",
        "skill_id": "6.EE.A.2",
        "difficulty": 2,
        "expected_steps": [
            "Identify the sum: x + 3",
            "Use parentheses to group the sum: (x + 3)",
            "Multiply the entire group by 5: 5(x + 3)",
            "Answer: 5(x + 3)"
        ],
        "source": "hand_curated"
    },
    {
        "title": "Evaluating an Expression",
        "text": "Evaluate the algebraic expression 3x² + 5 when x = 4.",
        "skill_id": "6.EE.A.2",
        "difficulty": 3,
        "expected_steps": [
            "Substitute x = 4 into the expression: 3(4)² + 5",
            "Calculate exponent first: 4² = 16",
            "Multiply: 3 × 16 = 48",
            "Add: 48 + 5 = 53",
            "Answer: 53"
        ],
        "source": "hand_curated"
    },
    {
        "title": "Geometry Expression: Perimeter of a Rectangle",
        "text": "The length of a rectangle is L and its width is W. Write an algebraic expression for the perimeter, then simplify it by factoring out the common factor.",
        "skill_id": "6.EE.A.2",
        "difficulty": 3,
        "expected_steps": [
            "Sum all 4 sides: L + W + L + W",
            "Combine like terms: 2L + 2W",
            "Factor out common factor 2: 2(L + W)",
            "Answer: 2L + 2W or 2(L + W)"
        ],
        "source": "hand_curated"
    },
    {
        "title": "Multi-Variable Store Inventory",
        "text": "A store sells notebooks for $n each and pens for $p each. Write an expression for the total cost of 4 notebooks and 6 pens, including an 8% sales tax on the total purchase.",
        "skill_id": "6.EE.A.2",
        "difficulty": 4,
        "expected_steps": [
            "Find subtotal: 4n + 6p",
            "Add 8% tax: multiply total by 1.08 or write (4n + 6p) + 0.08(4n + 6p)",
            "Simplify expression: 1.08(4n + 6p) = 4.32n + 6.48p",
            "Answer: 1.08(4n + 6p) or 4.32n + 6.48p"
        ],
        "source": "hand_curated"
    },
    {
        "title": "Complex Rate & Discount Expression",
        "text": "An online streaming service charges $m per month. New users get a 20% discount on the monthly rate for the first 3 months, and pay the regular rate for the remaining 9 months of the year. In addition, there is a one-time setup fee of $f. Write and simplify an algebraic expression for the total annual cost.",
        "skill_id": "6.EE.A.2",
        "difficulty": 5,
        "expected_steps": [
            "Discounted rate for first 3 months: 3 × (0.80m) = 2.4m",
            "Regular rate for next 9 months: 9 × m = 9m",
            "Combine monthly charges: 2.4m + 9m = 11.4m",
            "Add fixed setup fee: 11.4m + f",
            "Answer: 11.4m + f"
        ],
        "source": "hand_curated"
    },

    # =========================================================================
    # 6.EE.B.7 - Solving One-Step Equations
    # =========================================================================
    {
        "title": "Solving Addition Equation",
        "text": "Solve the equation for y: y + 14 = 39. Check your solution.",
        "skill_id": "6.EE.B.7",
        "difficulty": 1,
        "expected_steps": [
            "Isolate variable by applying inverse operation: subtract 14 from both sides",
            "y = 39 - 14",
            "Calculate: y = 25",
            "Check: 25 + 14 = 39 ✓",
            "Answer: y = 25"
        ],
        "source": "hand_curated"
    },
    {
        "title": "Solving Subtraction Equation",
        "text": "Solve for m: m - 8 = 21.",
        "skill_id": "6.EE.B.7",
        "difficulty": 1,
        "expected_steps": [
            "Isolate variable by adding 8 to both sides: m - 8 + 8 = 21 + 8",
            "Calculate: m = 29",
            "Check: 29 - 8 = 21 ✓",
            "Answer: m = 29"
        ],
        "source": "hand_curated"
    },
    {
        "title": "Solving Multiplication Equation",
        "text": "Solve for p: 6p = 54.",
        "skill_id": "6.EE.B.7",
        "difficulty": 2,
        "expected_steps": [
            "Isolate variable by dividing both sides by 6: 6p/6 = 54/6",
            "Calculate: p = 9",
            "Check: 6 × 9 = 54 ✓",
            "Answer: p = 9"
        ],
        "source": "hand_curated"
    },
    {
        "title": "Solving Division Equation",
        "text": "Solve for w: w / 7 = 8.",
        "skill_id": "6.EE.B.7",
        "difficulty": 2,
        "expected_steps": [
            "Isolate variable by multiplying both sides by 7: (w / 7) × 7 = 8 × 7",
            "Calculate: w = 56",
            "Check: 56 ÷ 7 = 8 ✓",
            "Answer: w = 56"
        ],
        "source": "hand_curated"
    },
    {
        "title": "One-Step Equation with Decimals",
        "text": "Solve for k: k + 4.75 = 12.50.",
        "skill_id": "6.EE.B.7",
        "difficulty": 3,
        "expected_steps": [
            "Subtract 4.75 from both sides: k = 12.50 - 4.75",
            "Align decimal places and subtract: 12.50 - 4.75 = 7.75",
            "Check: 7.75 + 4.75 = 12.50 ✓",
            "Answer: k = 7.75"
        ],
        "source": "hand_curated"
    },
    {
        "title": "One-Step Equation with Fractions",
        "text": "Solve for x: (3/4)x = 18.",
        "skill_id": "6.EE.B.7",
        "difficulty": 3,
        "expected_steps": [
            "Multiply both sides by the reciprocal (4/3): x = 18 × (4/3)",
            "Simplify 18 ÷ 3 = 6",
            "Multiply: 6 × 4 = 24",
            "Check: 3/4 × 24 = 18 ✓",
            "Answer: x = 24"
        ],
        "source": "hand_curated"
    },
    {
        "title": "Word Problem to One-Step Equation",
        "text": "After paying $18 for a concert ticket, Danielle has $37 left in her wallet. Write an equation using the variable m for Danielle's starting money, and solve it.",
        "skill_id": "6.EE.B.7",
        "difficulty": 4,
        "expected_steps": [
            "Define variable: let m = starting money",
            "Write equation: m - 18 = 37",
            "Solve by adding 18 to both sides: m = 37 + 18",
            "Calculate: m = 55",
            "Answer: Danielle started with $55"
        ],
        "source": "hand_curated"
    },
    {
        "title": "Rational Coefficient Equation",
        "text": "Solve for d: -2.5d = 35. Explain the sign of the solution.",
        "skill_id": "6.EE.B.7",
        "difficulty": 5,
        "expected_steps": [
            "Divide both sides by -2.5: d = 35 / (-2.5)",
            "A positive divided by a negative yields a negative result",
            "Calculate: 35 ÷ 2.5 = 350 ÷ 25 = 14, so d = -14",
            "Check: -2.5 × (-14) = 35 ✓",
            "Answer: d = -14"
        ],
        "source": "hand_curated"
    },

    # =========================================================================
    # 7.EE.B.4 - Solving Multi-Step Equations & Inequalities
    # =========================================================================
    {
        "title": "Two-Step Linear Equation",
        "text": "Solve for x: 3x + 7 = 28.",
        "skill_id": "7.EE.B.4",
        "difficulty": 1,
        "expected_steps": [
            "Step 1: Subtract 7 from both sides: 3x = 28 - 7 = 21",
            "Step 2: Divide both sides by 3: x = 21 / 3",
            "Calculate: x = 7",
            "Check: 3(7) + 7 = 21 + 7 = 28 ✓",
            "Answer: x = 7"
        ],
        "source": "hand_curated"
    },
    {
        "title": "Two-Step with Subtraction",
        "text": "Solve for a: 5a - 12 = 38.",
        "skill_id": "7.EE.B.4",
        "difficulty": 2,
        "expected_steps": [
            "Step 1: Add 12 to both sides: 5a = 38 + 12 = 50",
            "Step 2: Divide both sides by 5: a = 50 / 5",
            "Calculate: a = 10",
            "Check: 5(10) - 12 = 50 - 12 = 38 ✓",
            "Answer: a = 10"
        ],
        "source": "hand_curated"
    },
    {
        "title": "Distributive Property Equation",
        "text": "Solve for y: 4(y - 3) = 28.",
        "skill_id": "7.EE.B.4",
        "difficulty": 2,
        "expected_steps": [
            "Step 1: Distribute 4 (or divide both sides by 4): y - 3 = 28 / 4 = 7",
            "Step 2: Add 3 to both sides: y = 7 + 3",
            "Calculate: y = 10",
            "Check: 4(10 - 3) = 4(7) = 28 ✓",
            "Answer: y = 10"
        ],
        "source": "hand_curated"
    },
    {
        "title": "Variables on Both Sides",
        "text": "Solve for x: 7x + 5 = 3x + 29.",
        "skill_id": "7.EE.B.4",
        "difficulty": 3,
        "expected_steps": [
            "Step 1: Subtract 3x from both sides: 4x + 5 = 29",
            "Step 2: Subtract 5 from both sides: 4x = 24",
            "Step 3: Divide by 4: x = 6",
            "Check: 7(6) + 5 = 42 + 5 = 47; 3(6) + 29 = 18 + 29 = 47 ✓",
            "Answer: x = 6"
        ],
        "source": "hand_curated"
    },
    {
        "title": "Multi-Step Word Problem: Gym Membership",
        "text": "A gym charges a registration fee of $45 and $25 per month. Jackson has budgeted $220 for his membership. For how many months can Jackson belong to the gym? Write and solve an equation.",
        "skill_id": "7.EE.B.4",
        "difficulty": 3,
        "expected_steps": [
            "Let m = number of months",
            "Write equation: 25m + 45 = 220",
            "Subtract 45 from both sides: 25m = 175",
            "Divide by 25: m = 175 / 25 = 7",
            "Answer: Jackson can belong to the gym for 7 months"
        ],
        "source": "hand_curated"
    },
    {
        "title": "Solving Multi-Step Linear Inequality",
        "text": "Solve the inequality: 2x - 5 < 11. Graph the solution description on a number line.",
        "skill_id": "7.EE.B.4",
        "difficulty": 4,
        "expected_steps": [
            "Step 1: Add 5 to both sides: 2x < 16",
            "Step 2: Divide both sides by 2 (positive number, inequality direction remains): x < 8",
            "Graph: Open circle at 8, shading to the left toward negative infinity",
            "Answer: x < 8"
        ],
        "source": "hand_curated"
    },
    {
        "title": "Negative Coefficient Inequality with Sign Flip",
        "text": "Solve the inequality: -3x + 12 ≤ 27. Explain why the inequality sign flips.",
        "skill_id": "7.EE.B.4",
        "difficulty": 4,
        "expected_steps": [
            "Step 1: Subtract 12 from both sides: -3x ≤ 15",
            "Step 2: Divide by -3. CRITICAL: When dividing or multiplying by a negative number, the inequality sign must flip (≤ becomes ≥)",
            "Calculate: x ≥ 15 / (-3) → x ≥ -5",
            "Check: Test x = 0 (greater than -5): -3(0) + 12 = 12 ≤ 27 ✓",
            "Answer: x ≥ -5"
        ],
        "source": "hand_curated"
    },
    {
        "title": "Challenge: Perimeter Geometry with Variables",
        "text": "The length of a rectangular soccer field is 10 yards more than twice its width. The perimeter of the field is 260 yards. Write a multi-step equation for the width w and find the exact length and width.",
        "skill_id": "7.EE.B.4",
        "difficulty": 5,
        "expected_steps": [
            "Let width = w, length = 2w + 10",
            "Perimeter formula: P = 2(length + width) → 2((2w + 10) + w) = 260",
            "Simplify inside parentheses: 2(3w + 10) = 260",
            "Divide by 2: 3w + 10 = 130",
            "Subtract 10: 3w = 120 → w = 40 yards",
            "Find length: 2(40) + 10 = 90 yards",
            "Check: 2(90 + 40) = 2(130) = 260 ✓",
            "Answer: Width = 40 yards, Length = 90 yards"
        ],
        "source": "hand_curated"
    },

    # Additional 4.NF.A.1 problems (Equivalent Fractions)
    {
        "title": "Fraction Strips: Thirds and Sixths",
        "text": "Using a fraction strip model, find the missing numerator: 1/3 = ?/6. What number replaces the question mark?",
        "skill_id": "4.NF.A.1",
        "difficulty": 1,
        "expected_steps": [
            "Find the scale factor for the denominator: 3 × 2 = 6",
            "Multiply the numerator by 2: 1 × 2 = 2",
            "Verify: Two 1/6 strips equal one 1/3 strip",
            "Answer: 1/3 = 2/6, so the missing number is 2"
        ],
        "source": "hand_curated"
    },
    {
        "title": "Equivalent Fractions: Fourths to Twelfths",
        "text": "Fill in the blank to make the fractions equivalent: 3/4 = ?/12.",
        "skill_id": "4.NF.A.1",
        "difficulty": 1,
        "expected_steps": [
            "Determine the factor: 4 × 3 = 12",
            "Multiply the numerator: 3 × 3 = 9",
            "Answer: 3/4 = 9/12, so the missing number is 9"
        ],
        "source": "hand_curated"
    },
    {
        "title": "Simplifying Tenths: Four-Tenths",
        "text": "Simplify 4/10 to its lowest terms. Explain which common factor was divided out.",
        "skill_id": "4.NF.A.1",
        "difficulty": 2,
        "expected_steps": [
            "Find common factor of 4 and 10: both are divisible by 2",
            "Divide numerator: 4 ÷ 2 = 2",
            "Divide denominator: 10 ÷ 2 = 5",
            "Answer: 4/10 in simplest form is 2/5"
        ],
        "source": "hand_curated"
    },
    {
        "title": "Simplifying Fifteenths: Nine-Fifteenths",
        "text": "Reduce the fraction 9/15 to simplest form.",
        "skill_id": "4.NF.A.1",
        "difficulty": 2,
        "expected_steps": [
            "Find greatest common factor of 9 and 15: GCF is 3",
            "Divide numerator: 9 ÷ 3 = 3",
            "Divide denominator: 15 ÷ 3 = 5",
            "Answer: 9/15 = 3/5"
        ],
        "source": "hand_curated"
    },
    {
        "title": "Common Denominator: Halves and Thirds",
        "text": "Rewrite 1/2 and 2/3 so that they have a common denominator of 6.",
        "skill_id": "4.NF.A.1",
        "difficulty": 2,
        "expected_steps": [
            "Convert 1/2: multiply numerator and denominator by 3 → 3/6",
            "Convert 2/3: multiply numerator and denominator by 2 → 4/6",
            "Answer: 1/2 = 3/6 and 2/3 = 4/6"
        ],
        "source": "hand_curated"
    },
    {
        "title": "Simplifying Thirty-Sixths: 24/36",
        "text": "Reduce 24/36 to its simplest form by dividing by the greatest common factor.",
        "skill_id": "4.NF.A.1",
        "difficulty": 3,
        "expected_steps": [
            "List common factors of 24 and 36: 1, 2, 3, 4, 6, 12",
            "Greatest common factor is 12",
            "Divide numerator: 24 ÷ 12 = 2",
            "Divide denominator: 36 ÷ 12 = 3",
            "Answer: 24/36 in simplest form is 2/3"
        ],
        "source": "hand_curated"
    },
    {
        "title": "Equivalent Fraction in a Recipe",
        "text": "A pancake recipe calls for 4/6 cup of melted butter. Maria only has a 1/3 cup measuring cup. How many 1/3 cups of melted butter should Maria pour?",
        "skill_id": "4.NF.A.1",
        "difficulty": 3,
        "expected_steps": [
            "Simplify 4/6 to thirds: divide numerator and denominator by 2",
            "4 ÷ 2 = 2 and 6 ÷ 2 = 3 → 4/6 = 2/3",
            "2/3 consists of two 1/3 units",
            "Answer: Maria should pour two 1/3 cups of butter"
        ],
        "source": "hand_curated"
    },
    {
        "title": "Comparing Fractions on a Ruler: 5/8 vs 7/12",
        "text": "Compare the fractions 5/8 and 7/12 by finding equivalent fractions with a common denominator of 24. Which is greater?",
        "skill_id": "4.NF.A.1",
        "difficulty": 4,
        "expected_steps": [
            "Convert 5/8: 24 ÷ 8 = 3 → (5×3)/(8×3) = 15/24",
            "Convert 7/12: 24 ÷ 12 = 2 → (7×2)/(12×2) = 14/24",
            "Compare numerators: 15/24 > 14/24",
            "Answer: 5/8 is greater than 7/12"
        ],
        "source": "hand_curated"
    },
    {
        "title": "Architect Blueprint Scaling",
        "text": "On an architectural drawing, a wall has a thickness of 6/16 inch. A builder needs to express this thickness in 32nds for precision drilling, and in 8ths for rough cutting. Find both equivalent fractions.",
        "skill_id": "4.NF.A.1",
        "difficulty": 4,
        "expected_steps": [
            "Convert to 32nds: multiply top and bottom by 2 → (6×2)/(16×2) = 12/32 inch",
            "Convert to 8ths: divide top and bottom by 2 → (6÷2)/(16÷2) = 3/8 inch",
            "Check equivalence: 3/8 = 6/16 = 12/32 = 0.375 inch ✓",
            "Answer: 12/32 inch for precision drilling and 3/8 inch for rough cutting"
        ],
        "source": "hand_curated"
    },
    {
        "title": "Fraction Equivalence with Unknowns",
        "text": "Given that 3/x = 9/12 and y/20 = 2/5, find the values of x and y, and compute x + y.",
        "skill_id": "4.NF.A.1",
        "difficulty": 5,
        "expected_steps": [
            "Solve for x: Simplify 9/12 to 3/4. Since 3/x = 3/4, x = 4",
            "Solve for y: 2/5 = (2×4)/(5×4) = 8/20. Therefore, y = 8",
            "Compute sum: x + y = 4 + 8 = 12",
            "Answer: x = 4, y = 8, and x + y = 12"
        ],
        "source": "hand_curated"
    },
    {
        "title": "Chain of Equivalent Fractions Puzzle",
        "text": "Complete the chain of four equivalent fractions: 15/25 = 3/? = ?/40 = 60/?.",
        "skill_id": "4.NF.A.1",
        "difficulty": 5,
        "expected_steps": [
            "Simplify 15/25: divide top and bottom by 5 → 3/5",
            "First blank: 15/25 = 3/5 (denominator is 5)",
            "Second blank: 3/5 = ?/40 → 40 ÷ 5 = 8 → 3 × 8 = 24/40 (numerator is 24)",
            "Third blank: 3/5 = 60/? → 60 ÷ 3 = 20 → 5 × 20 = 100 (denominator is 100)",
            "Answer: 15/25 = 3/5 = 24/40 = 60/100"
        ],
        "source": "hand_curated"
    },

    # Additional 6.EE.A.2 problems (Algebraic Expressions)
    {
        "title": "Writing Quotient Expressions",
        "text": "Write an algebraic expression for: 'the quotient of a number z and 8'.",
        "skill_id": "6.EE.A.2",
        "difficulty": 1,
        "expected_steps": [
            "Identify the variable: z",
            "'Quotient' indicates division",
            "Write expression: z / 8 or z ÷ 8",
            "Answer: z / 8"
        ],
        "source": "hand_curated"
    },
    {
        "title": "Writing Product Expressions",
        "text": "Write an algebraic expression for: 'the product of 9 and a variable w'.",
        "skill_id": "6.EE.A.2",
        "difficulty": 1,
        "expected_steps": [
            "Identify variable: w",
            "'Product' indicates multiplication",
            "In algebra, write coefficient directly before variable: 9w",
            "Answer: 9w"
        ],
        "source": "hand_curated"
    },
    {
        "title": "Expressions with Two Variables",
        "text": "Write an algebraic expression for: 'the sum of 4 times a and 3 times b'.",
        "skill_id": "6.EE.A.2",
        "difficulty": 2,
        "expected_steps": [
            "4 times a is 4a",
            "3 times b is 3b",
            "Sum combines them with addition: 4a + 3b",
            "Answer: 4a + 3b"
        ],
        "source": "hand_curated"
    },
    {
        "title": "Temperature Conversion Expression",
        "text": "The formula to convert temperature from Celsius (C) to Fahrenheit is 1.8 times the Celsius temperature plus 32. Write the algebraic expression and evaluate it when C = 25.",
        "skill_id": "6.EE.A.2",
        "difficulty": 2,
        "expected_steps": [
            "Write expression: 1.8C + 32",
            "Substitute C = 25: 1.8(25) + 32",
            "Calculate: 45 + 32 = 77",
            "Answer: Expression is 1.8C + 32; at C = 25 it equals 77°F"
        ],
        "source": "hand_curated"
    },
    {
        "title": "Area of a Triangle Expression",
        "text": "The area of a triangle with base b and height h is given by (1/2)bh. Evaluate the area when b = 14 cm and h = 9 cm.",
        "skill_id": "6.EE.A.2",
        "difficulty": 3,
        "expected_steps": [
            "Substitute values: Area = (1/2) × 14 × 9",
            "Calculate: (1/2 × 14) = 7",
            "Multiply: 7 × 9 = 63",
            "Answer: Area is 63 cm²"
        ],
        "source": "hand_curated"
    },
    {
        "title": "Consecutive Integers Expression",
        "text": "Let n represent an integer. Write an expression for the sum of three consecutive integers starting with n, and simplify it by combining like terms.",
        "skill_id": "6.EE.A.2",
        "difficulty": 3,
        "expected_steps": [
            "The three consecutive integers are: n, n + 1, and n + 2",
            "Sum them: n + (n + 1) + (n + 2)",
            "Combine like terms: (n + n + n) + (1 + 2) = 3n + 3",
            "Answer: 3n + 3"
        ],
        "source": "hand_curated"
    },
    {
        "title": "Phone Plan Monthly Bill Expression",
        "text": "A mobile carrier charges $35 as a flat monthly fee, plus $0.05 per text message m and $12 per gigabyte g of data used. Write an algebraic expression for the total monthly bill.",
        "skill_id": "6.EE.A.2",
        "difficulty": 4,
        "expected_steps": [
            "Flat fee: 35",
            "Cost for m text messages: 0.05m",
            "Cost for g gigabytes of data: 12g",
            "Combine terms: 35 + 0.05m + 12g",
            "Answer: 35 + 0.05m + 12g"
        ],
        "source": "hand_curated"
    },
    {
        "title": "Evaluating Multi-Variable Rational Expression",
        "text": "Evaluate the algebraic expression (2a + 3b) / (c - 1) when a = 6, b = 4, and c = 5.",
        "skill_id": "6.EE.A.2",
        "difficulty": 4,
        "expected_steps": [
            "Substitute values into numerator: 2(6) + 3(4) = 12 + 12 = 24",
            "Substitute into denominator: 5 - 1 = 4",
            "Divide: 24 / 4 = 6",
            "Answer: 6"
        ],
        "source": "hand_curated"
    },
    {
        "title": "Compound Profit Model Expression",
        "text": "A company manufactures backpacks. Revenue from selling x backpacks is R = 30x. The total cost of producing x backpacks is C = 12x + 450. Profit is defined as P = Revenue - Cost. Write a simplified expression for profit P, and find the profit when x = 50 backpacks.",
        "skill_id": "6.EE.A.2",
        "difficulty": 5,
        "expected_steps": [
            "Write profit expression: P = 30x - (12x + 450)",
            "Distribute the negative sign: P = 30x - 12x - 450",
            "Combine like terms: P = 18x - 450",
            "Evaluate when x = 50: P = 18(50) - 450 = 900 - 450 = 450",
            "Answer: Simplified expression is 18x - 450; profit for 50 backpacks is $450"
        ],
        "source": "hand_curated"
    },
    {
        "title": "Volume of a Cylinder with Constrained Dimensions",
        "text": "The volume of a cylinder is V = πr²h. If the height h is designed to be 4 times the radius r, express the volume in terms of r alone. What is the degree of the resulting monomial?",
        "skill_id": "6.EE.A.2",
        "difficulty": 5,
        "expected_steps": [
            "Substitute h = 4r into volume formula: V = π × r² × (4r)",
            "Multiply terms: V = 4πr³",
            "Identify the power of variable r: r is raised to the 3rd power (degree 3 / cubic)",
            "Answer: V = 4πr³, which has degree 3"
        ],
        "source": "hand_curated"
    },

    # Additional 6.EE.B.7 problems (One-Step Equations)
    {
        "title": "One-Step Subtraction with Multi-Digit Numbers",
        "text": "Solve for x: x - 45 = 120. Check your answer.",
        "skill_id": "6.EE.B.7",
        "difficulty": 1,
        "expected_steps": [
            "Add 45 to both sides: x = 120 + 45",
            "Calculate: x = 165",
            "Check: 165 - 45 = 120 ✓",
            "Answer: x = 165"
        ],
        "source": "hand_curated"
    },
    {
        "title": "One-Step Division: y / 9 = 7",
        "text": "Solve the equation for y: y / 9 = 7.",
        "skill_id": "6.EE.B.7",
        "difficulty": 1,
        "expected_steps": [
            "Apply inverse operation: multiply both sides by 9",
            "y = 7 × 9",
            "Calculate: y = 63",
            "Check: 63 ÷ 9 = 7 ✓",
            "Answer: y = 63"
        ],
        "source": "hand_curated"
    },
    {
        "title": "One-Step Multiplication: 10m = 240",
        "text": "Solve for m: 10m = 240.",
        "skill_id": "6.EE.B.7",
        "difficulty": 2,
        "expected_steps": [
            "Divide both sides by 10: m = 240 / 10",
            "Calculate: m = 24",
            "Check: 10 × 24 = 240 ✓",
            "Answer: m = 24"
        ],
        "source": "hand_curated"
    },
    {
        "title": "One-Step Equation with Negative Result",
        "text": "Solve for x: x + 15 = 8. Explain how negative numbers apply.",
        "skill_id": "6.EE.B.7",
        "difficulty": 2,
        "expected_steps": [
            "Subtract 15 from both sides: x = 8 - 15",
            "Subtracting a larger number from a smaller number yields a negative: 8 - 15 = -7",
            "Check: -7 + 15 = 8 ✓",
            "Answer: x = -7"
        ],
        "source": "hand_curated"
    },
    {
        "title": "One-Step Decimals: Savings Account",
        "text": "A student added $24.50 to her bank account, bringing the total balance to $100.00. Write an equation using b for the initial balance, and solve it.",
        "skill_id": "6.EE.B.7",
        "difficulty": 3,
        "expected_steps": [
            "Write equation: b + 24.50 = 100.00",
            "Subtract 24.50 from both sides: b = 100.00 - 24.50",
            "Calculate: b = 75.50",
            "Answer: The initial balance was $75.50"
        ],
        "source": "hand_curated"
    },
    {
        "title": "Fraction Coefficient: Half of a Number",
        "text": "Solve for x: (1/2)x = 36.",
        "skill_id": "6.EE.B.7",
        "difficulty": 3,
        "expected_steps": [
            "Multiply both sides by reciprocal 2: x = 36 × 2",
            "Calculate: x = 72",
            "Check: 1/2 of 72 is 36 ✓",
            "Answer: x = 72"
        ],
        "source": "hand_curated"
    },
    {
        "title": "Geometry Equilateral Triangle Perimeter",
        "text": "An equilateral triangle has 3 sides of equal length s. Its perimeter is 51 centimeters. Write and solve a one-step equation to find the side length s.",
        "skill_id": "6.EE.B.7",
        "difficulty": 4,
        "expected_steps": [
            "Write equation: 3s = 51",
            "Divide both sides by 3: s = 51 / 3",
            "Calculate: s = 17 cm",
            "Check: 17 + 17 + 17 = 51 ✓",
            "Answer: Each side is 17 cm long"
        ],
        "source": "hand_curated"
    },
    {
        "title": "One-Step Equation with Negative Fraction",
        "text": "Solve for y: -(4/5)y = 20.",
        "skill_id": "6.EE.B.7",
        "difficulty": 4,
        "expected_steps": [
            "Multiply both sides by reciprocal -(5/4): y = 20 × -(5/4)",
            "Simplify 20 ÷ 4 = 5",
            "Multiply: 5 × (-5) = -25",
            "Check: -(4/5) × (-25) = 20 ✓",
            "Answer: y = -25"
        ],
        "source": "hand_curated"
    },
    {
        "title": "Speed, Distance, Time One-Step Equation",
        "text": "A passenger train travels at a constant speed of 65 miles per hour. The train covers a distance of 357.5 miles. Write an equation using t for time in hours, and solve for t.",
        "skill_id": "6.EE.B.7",
        "difficulty": 5,
        "expected_steps": [
            "Formula: Distance = rate × time → 65t = 357.5",
            "Divide both sides by 65: t = 357.5 / 65",
            "Calculate: 357.5 ÷ 65 = 5.5",
            "Answer: t = 5.5 hours (or 5 hours 30 minutes)"
        ],
        "source": "hand_curated"
    },
    {
        "title": "Submarine Depth Change Equation",
        "text": "A research submarine was cruising at an initial depth d below sea level. It dove down an additional 180 meters to reach its final depth of -520 meters. Write and solve an equation for the starting depth d.",
        "skill_id": "6.EE.B.7",
        "difficulty": 5,
        "expected_steps": [
            "Write equation: d - 180 = -520",
            "Add 180 to both sides: d = -520 + 180",
            "Calculate: d = -340 meters",
            "Check: -340 - 180 = -520 ✓",
            "Answer: The starting depth was -340 meters"
        ],
        "source": "hand_curated"
    },

    # Additional 7.EE.B.4 problems (Multi-Step Equations & Inequalities)
    {
        "title": "Two-Step Linear Equation with Fraction",
        "text": "Solve for x: (1/2)x + 4 = 10.",
        "skill_id": "7.EE.B.4",
        "difficulty": 2,
        "expected_steps": [
            "Step 1: Subtract 4 from both sides: (1/2)x = 10 - 4 = 6",
            "Step 2: Multiply both sides by 2: x = 6 × 2 = 12",
            "Check: (1/2)(12) + 4 = 6 + 4 = 10 ✓",
            "Answer: x = 12"
        ],
        "source": "hand_curated"
    },
    {
        "title": "Two-Step with Negative Variable Term",
        "text": "Solve for x: 15 - 2x = 7.",
        "skill_id": "7.EE.B.4",
        "difficulty": 2,
        "expected_steps": [
            "Step 1: Subtract 15 from both sides: -2x = 7 - 15 = -8",
            "Step 2: Divide both sides by -2: x = -8 / -2 = 4",
            "Check: 15 - 2(4) = 15 - 8 = 7 ✓",
            "Answer: x = 4"
        ],
        "source": "hand_curated"
    },
    {
        "title": "Distributive Property with Negatives",
        "text": "Solve for x: -2(x + 5) = 14.",
        "skill_id": "7.EE.B.4",
        "difficulty": 3,
        "expected_steps": [
            "Step 1: Divide both sides by -2: x + 5 = 14 / (-2) = -7",
            "Step 2: Subtract 5 from both sides: x = -7 - 5 = -12",
            "Check: -2(-12 + 5) = -2(-7) = 14 ✓",
            "Answer: x = -12"
        ],
        "source": "hand_curated"
    },
    {
        "title": "Consecutive Odd Numbers Word Problem",
        "text": "The sum of two consecutive odd integers is 48. Write an equation using x for the smaller odd integer, and find both integers.",
        "skill_id": "7.EE.B.4",
        "difficulty": 3,
        "expected_steps": [
            "Let x = smaller odd integer, x + 2 = next consecutive odd integer",
            "Write equation: x + (x + 2) = 48",
            "Combine like terms: 2x + 2 = 48",
            "Subtract 2: 2x = 46 → x = 23",
            "Find second integer: 23 + 2 = 25",
            "Check: 23 + 25 = 48 ✓",
            "Answer: The integers are 23 and 25"
        ],
        "source": "hand_curated"
    },
    {
        "title": "Solving Linear Inequality: 4x + 9 > 33",
        "text": "Solve the inequality: 4x + 9 > 33. State your solution as an inequality.",
        "skill_id": "7.EE.B.4",
        "difficulty": 4,
        "expected_steps": [
            "Subtract 9 from both sides: 4x > 33 - 9 → 4x > 24",
            "Divide both sides by 4: x > 24 / 4 → x > 6",
            "Check with test value x = 7: 4(7) + 9 = 28 + 9 = 37 > 33 ✓",
            "Answer: x > 6"
        ],
        "source": "hand_curated"
    },
    {
        "title": "Negative Distributive Inequality",
        "text": "Solve the inequality: -4(y - 2) < 20. Remember to flip the inequality sign when dividing by a negative number.",
        "skill_id": "7.EE.B.4",
        "difficulty": 4,
        "expected_steps": [
            "Divide both sides by -4 and reverse the inequality sign: y - 2 > 20 / (-4)",
            "Simplify: y - 2 > -5",
            "Add 2 to both sides: y > -5 + 2 → y > -3",
            "Check with test value y = 0: -4(0 - 2) = -4(-2) = 8 < 20 ✓",
            "Answer: y > -3"
        ],
        "source": "hand_curated"
    },
    {
        "title": "Taxi Fare Budget Inequality",
        "text": "A city taxi charges a base pickup fee of $3.50 plus $2.25 per mile driven. Liam has $26.00 in cash. Write and solve an inequality to determine the maximum number of full miles m Liam can travel.",
        "skill_id": "7.EE.B.4",
        "difficulty": 4,
        "expected_steps": [
            "Write inequality: 2.25m + 3.50 ≤ 26.00",
            "Subtract 3.50: 2.25m ≤ 22.50",
            "Divide by 2.25: m ≤ 22.50 / 2.25 → m ≤ 10",
            "Answer: Liam can travel at most 10 miles"
        ],
        "source": "hand_curated"
    },
    {
        "title": "Variables on Both Sides with Fractions",
        "text": "Solve for x: (3/4)x - 2 = (1/4)x + 6.",
        "skill_id": "7.EE.B.4",
        "difficulty": 5,
        "expected_steps": [
            "Subtract (1/4)x from both sides: (3/4 - 1/4)x - 2 = 6 → (2/4)x - 2 = 6",
            "Simplify fraction: (1/2)x - 2 = 6",
            "Add 2 to both sides: (1/2)x = 8",
            "Multiply by 2: x = 16",
            "Check: (3/4)(16) - 2 = 12 - 2 = 10; (1/4)(16) + 6 = 4 + 6 = 10 ✓",
            "Answer: x = 16"
        ],
        "source": "hand_curated"
    },
    {
        "title": "Comprehensive Business Profit Inequality",
        "text": "A high school entrepreneur club sells custom insulated water bottles for $18 each. Their fixed equipment rental cost is $250, and each bottle costs $8 to produce. Write and solve an inequality for the number of bottles b the club must sell to make a net profit of at least $500.",
        "skill_id": "7.EE.B.4",
        "difficulty": 5,
        "expected_steps": [
            "Total Revenue: 18b; Total Cost: 8b + 250",
            "Profit = Revenue - Cost = 18b - (8b + 250) = 10b - 250",
            "Set up inequality for profit ≥ 500: 10b - 250 ≥ 500",
            "Add 250 to both sides: 10b ≥ 750",
            "Divide by 10: b ≥ 75",
            "Answer: The club must sell at least 75 water bottles"
        ],
        "source": "hand_curated"
    },

    # Additional high-tier problems for 3.OA.A.1, 3.OA.A.2, 3.OA.D.8, 4.NF.B.3, 4.NF.B.4, 5.NF.B.7
    {
        "title": "Solar Array Panel Output",
        "text": "A solar farm has 18 rows of solar panels with 24 panels in each row. If each panel generates 5 kilowatt-hours on a sunny day, how many kilowatt-hours are generated in total?",
        "skill_id": "3.OA.A.1",
        "difficulty": 4,
        "expected_steps": [
            "Find total panels: 18 × 24",
            "Calculate: (18 × 20) + (18 × 4) = 360 + 72 = 432 panels",
            "Multiply total panels by output per panel: 432 × 5",
            "Calculate: (400 × 5) + (30 × 5) + (2 × 5) = 2000 + 150 + 10 = 2160 kWh",
            "Answer: 2,160 kilowatt-hours are generated"
        ],
        "source": "hand_curated"
    },
    {
        "title": "Stadium Seating Section Challenge",
        "text": "A stadium section has 25 rows of seats. Row 1 has 30 seats, and every subsequent row has 2 additional seats compared to the row in front of it. How many total seats are in this section?",
        "skill_id": "3.OA.A.1",
        "difficulty": 5,
        "expected_steps": [
            "Recognize arithmetic progression: First row = 30, last row (row 25) = 30 + 24(2) = 30 + 48 = 78 seats",
            "Use average seats formula: (first + last) / 2 = (30 + 78) / 2 = 108 / 2 = 54 seats per row",
            "Multiply average by number of rows: 25 × 54",
            "Calculate: (25 × 50) + (25 × 4) = 1250 + 100 = 1350",
            "Answer: There are 1,350 total seats in the section"
        ],
        "source": "hand_curated"
    },
    {
        "title": "Warehouse Pallet Distribution",
        "text": "A logistics center receives a shipment of 864 laptops. They must distribute them equally among 18 regional retail branches. How many laptops does each branch receive?",
        "skill_id": "3.OA.A.2",
        "difficulty": 4,
        "expected_steps": [
            "Set up long division: 864 ÷ 18",
            "Estimate: 18 × 40 = 720; remaining: 864 - 720 = 144",
            "Divide remaining: 18 × 8 = 144",
            "Combine quotient parts: 40 + 8 = 48",
            "Answer: Each branch receives 48 laptops"
        ],
        "source": "hand_curated"
    },
    {
        "title": "Emergency Supply Rations Allocation",
        "text": "A rescue boat carries 1,280 liters of drinking water. The crew has 32 people, and the voyage will take 10 days. If the water is rationed equally among all crew members for each day, how many liters does one person receive per day?",
        "skill_id": "3.OA.A.2",
        "difficulty": 5,
        "expected_steps": [
            "Calculate total person-days: 32 people × 10 days = 320 person-days",
            "Divide total water by total person-days: 1280 ÷ 320",
            "Simplify division: 128 ÷ 32 = 4",
            "Answer: Each person receives 4 liters of water per day"
        ],
        "source": "hand_curated"
    },
    {
        "title": "Charity 5K Race Registration Budget",
        "text": "A school charity race charges $15 for student runners and $25 for adult runners. 80 students and 45 adults registered. The school spent $320 on timing equipment and $250 on water and fruit. How much net profit did the charity raise?",
        "skill_id": "3.OA.D.8",
        "difficulty": 4,
        "expected_steps": [
            "Step 1: Calculate revenue from students: 80 × $15 = $1,200",
            "Step 2: Calculate revenue from adults: 45 × $25 = $1,125",
            "Step 3: Calculate total revenue: $1,200 + $1,125 = $2,325",
            "Step 4: Calculate total expenses: $320 + $250 = $570",
            "Step 5: Calculate net profit: $2,325 - $570 = $1,755",
            "Answer: The charity raised $1,755"
        ],
        "source": "hand_curated"
    },
    {
        "title": "School Auditorium Concert Revenue",
        "text": "An auditorium has 400 seats. 250 floor seats sell for $12 each, and the remaining seats are balcony seats selling for $8 each. During the concert, 90% of floor seats and 75% of balcony seats were sold. After paying $500 for lighting and sound, what was the net concert proceeds?",
        "skill_id": "3.OA.D.8",
        "difficulty": 5,
        "expected_steps": [
            "Step 1: Balcony seats count = 400 - 250 = 150 seats",
            "Step 2: Floor seats sold = 0.90 × 250 = 225 seats; Revenue = 225 × $12 = $2,700",
            "Step 3: Balcony seats sold = 0.75 × 150 = 112.5 → 112 tickets; Revenue = 112 × $8 = $896",
            "Step 4: Total ticket revenue = $2,700 + $896 = $3,596",
            "Step 5: Deduct audio/lighting expense: $3,596 - $500 = $3,096",
            "Answer: Net concert proceeds were $3,096"
        ],
        "source": "hand_curated"
    },
    {
        "title": "Multi-Step Recipe Batch Adjustment",
        "text": "A standard bread recipe uses 3 1/3 cups of bread flour and 1 1/4 cups of whole wheat flour. A bakery wants to make 3 1/2 batches. How much total flour (bread plus whole wheat) is needed?",
        "skill_id": "4.NF.B.4",
        "difficulty": 4,
        "expected_steps": [
            "Find total flour for 1 batch: 3 1/3 + 1 1/4 = 3 4/12 + 1 3/12 = 4 7/12 cups = 55/12 cups",
            "Multiply by 3 1/2 batches (7/2): (55/12) × (7/2)",
            "Multiply numerators and denominators: (55 × 7) / (12 × 2) = 385 / 24",
            "Convert to mixed number: 385 ÷ 24 = 16 remainder 1 → 16 1/24 cups",
            "Answer: 16 1/24 cups of total flour are needed"
        ],
        "source": "hand_curated"
    },
    {
        "title": "Aquarium Water Replacement System",
        "text": "A large aquarium holds 240 gallons of water. Due to evaporation, 1/12 of the water is lost each week. In addition, the owner drains and replaces 1/6 of the tank every two weeks for cleaning. Over a 2-week period, what fraction and volume of water is replaced in total?",
        "skill_id": "4.NF.B.4",
        "difficulty": 5,
        "expected_steps": [
            "Evaporation over 2 weeks: 2 × (1/12) = 2/12 = 1/6 of the tank",
            "Cleaning drainage: 1/6 of the tank",
            "Total fraction replaced: 1/6 + 1/6 = 2/6 = 1/3 of the tank",
            "Calculate volume: 240 × 1/3 = 80 gallons",
            "Answer: 1/3 of the tank (80 gallons) is replaced in total"
        ],
        "source": "hand_curated"
    },
    {
        "title": "Industrial Fluid Bottling Line",
        "text": "A chemical packaging line has a tank containing 36 3/4 liters of specialized solution. Each test vial requires 3/16 liter of solution. How many full vials can be filled from the tank, and what fraction of a vial of solution is left over?",
        "skill_id": "5.NF.B.7",
        "difficulty": 5,
        "expected_steps": [
            "Convert 36 3/4 to improper fraction: (36 × 4 + 3)/4 = 147/4 liters",
            "Divide by vial size 3/16: (147/4) ÷ (3/16)",
            "Multiply by reciprocal: (147/4) × (16/3)",
            "Simplify before multiplying: (147 ÷ 3) × (16 ÷ 4) = 49 × 4 = 196",
            "Answer: Exactly 196 full vials can be filled with none left over"
        ],
        "source": "hand_curated"
    },
    {
        "title": "Carpenter's Precision Shelving",
        "text": "A carpenter is building floating shelves. A raw oak board is 5 1/4 feet long. Each shelf requires 5/6 of a foot of oak, with 1/8 of a foot wasted in saw blade kerf for each cut. How many complete shelves can be made?",
        "skill_id": "5.NF.B.7",
        "difficulty": 5,
        "expected_steps": [
            "Convert total length to inches or common denominator: LCD of 4, 6, 8 is 24",
            "Total length: 5 1/4 ft = 5 6/24 ft = 126/24 ft",
            "Wood used per shelf + cut: 5/6 + 1/8 = 20/24 + 3/24 = 23/24 ft",
            "Divide total length by wood per shelf: 126 ÷ 23",
            "Calculate: 126 ÷ 23 = 5 with remainder 11 (23 × 5 = 115, 126 - 115 = 11)",
            "Answer: 5 complete shelves can be made"
        ],
        "source": "hand_curated"
    }
]



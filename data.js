/* ═══════════════════════════════════════════════
   DATA - Courses & Quizzes
   ═══════════════════════════════════════════════ */

const COURSES = [
        { id:'js', title:'JavaScript Fundamentals', desc:'Variables, functions, DOM manipulation, and async programming.', icon:'fa-brands fa-js', color:'#F7DF1E', diff:'Beginner', img:'https://picsum.photos/seed/jscourse/600/400.jpg',
          lessons:[
            {id:'js1',title:'Variables & Data Types',done:false},
            {id:'js2',title:'Functions & Scope',done:false},
            {id:'js3',title:'DOM Manipulation',done:false},
            {id:'js4',title:'Events & Listeners',done:false},
            {id:'js5',title:'Async/Await',done:false},
            {id:'js6',title:'Error Handling',done:false},
            {id:'js7',title:'Array Methods',done:false},
            {id:'js8',title:'Objects & Prototypes',done:false}
          ]},
        { id:'py', title:'Python Essentials', desc:'Data types, control flow, functions, and file I/O basics.', icon:'fa-brands fa-python', color:'#3776AB', diff:'Beginner', img:'https://picsum.photos/seed/pycourse/600/400.jpg',
          lessons:[
            {id:'py1',title:'Hello World & Variables',done:false},
            {id:'py2',title:'Control Flow',done:false},
            {id:'py3',title:'Functions',done:false},
            {id:'py4',title:'Lists & Tuples',done:false},
            {id:'py5',title:'Dictionaries',done:false},
            {id:'py6',title:'File I/O',done:false},
            {id:'py7',title:'List Comprehensions',done:false},
            {id:'py8',title:'Modules & Imports',done:false}
          ]},
        { id:'html', title:'HTML & CSS Mastery', desc:'Semantic HTML, Flexbox, Grid, animations, and responsive design.', icon:'fa-brands fa-html5', color:'#E34F26', diff:'Beginner', img:'https://picsum.photos/seed/htmlcourse/600/400.jpg',
          lessons:[
            {id:'ht1',title:'Semantic HTML',done:false},
            {id:'ht2',title:'CSS Selectors',done:false},
            {id:'ht3',title:'Flexbox Layout',done:false},
            {id:'ht4',title:'CSS Grid',done:false},
            {id:'ht5',title:'Responsive Design',done:false},
            {id:'ht6',title:'CSS Transitions',done:false},
            {id:'ht7',title:'CSS Animations',done:false},
            {id:'ht8',title:'CSS Variables',done:false}
          ]},
        { id:'react', title:'React Framework', desc:'Components, state, props, hooks, and the component lifecycle.', icon:'fa-brands fa-react', color:'#61DAFB', diff:'Intermediate', img:'https://picsum.photos/seed/reactcourse/600/400.jpg',
          lessons:[
            {id:'rc1',title:'JSX Basics',done:false},
            {id:'rc2',title:'Components & Props',done:false},
            {id:'rc3',title:'useState Hook',done:false},
            {id:'rc4',title:'useEffect Hook',done:false},
            {id:'rc5',title:'Conditional Rendering',done:false},
            {id:'rc6',title:'Lists & Keys',done:false},
            {id:'rc7',title:'Context API',done:false},
            {id:'rc8',title:'Custom Hooks',done:false}
          ]},
        { id:'db', title:'Database Fundamentals', desc:'SQL queries, table design, relationships, and indexing.', icon:'fa-solid fa-database', color:'#336791', diff:'Intermediate', img:'https://picsum.photos/seed/dbcourse/600/400.jpg',
          lessons:[
            {id:'db1',title:'What is a Database?',done:false},
            {id:'db2',title:'SELECT Queries',done:false},
            {id:'db3',title:'WHERE & Filtering',done:false},
            {id:'db4',title:'JOINs',done:false},
            {id:'db5',title:'GROUP BY & Aggregates',done:false},
            {id:'db6',title:'INSERT, UPDATE, DELETE',done:false},
            {id:'db7',title:'Table Relationships',done:false},
            {id:'db8',title:'Indexing Basics',done:false}
          ]},
        { id:'algo', title:'Algorithms & DS', desc:'Arrays, linked lists, sorting, searching, and Big O notation.', icon:'fa-solid fa-diagram-project', color:'#FF6B6B', diff:'Advanced', img:'https://picsum.photos/seed/algocourse/600/400.jpg',
          lessons:[
            {id:'al1',title:'Big O Notation',done:false},
            {id:'al2',title:'Arrays & Strings',done:false},
            {id:'al3',title:'Linked Lists',done:false},
            {id:'al4',title:'Stacks & Queues',done:false},
            {id:'al5',title:'Binary Search',done:false},
            {id:'al6',title:'Sorting Algorithms',done:false},
            {id:'al7',title:'Recursion',done:false},
            {id:'al8',title:'Trees & Graphs Intro',done:false}
          ]}
    ];

    const QUIZZES = {
        js: { title:'JavaScript', icon:'fa-brands fa-js', color:'#F7DF1E',
          questions:[
            {q:'Which keyword declares a block-scoped variable?', opts:['var','let','both','neither'], ans:1},
            {q:'What does typeof null return?', opts:['"null"','"undefined"','"object"','"boolean"'], ans:2},
            {q:'Which method converts JSON to a JS object?', opts:['JSON.stringify()','JSON.parse()','JSON.convert()','JSON.decode()'], ans:1},
            {q:'What is the output of: [] == false?', opts:['true','false','TypeError','undefined'], ans:0}
          ]},
        py: { title:'Python', icon:'fa-brands fa-python', color:'#3776AB',
          questions:[
            {q:'Which data type is immutable in Python?', opts:['List','Dictionary','Tuple','Set'], ans:2},
            {q:'What does len() return for "hello"?', opts:['4','5','6','Error'], ans:1},
            {q:'Which keyword defines a function?', opts:['function','func','def','define'], ans:2},
            {q:'What is the output of: 2 ** 3?', opts:['6','8','9','5'], ans:1}
          ]},
        html: { title:'HTML & CSS', icon:'fa-brands fa-html5', color:'#E34F26',
          questions:[
            {q:'Which CSS property creates a flex container?', opts:['display:block','display:flex','display:grid','display:inline'], ans:1},
            {q:'What does "rem" stand for?', opts:['Root em','Relative em','Remote element','Rapid em'], ans:0},
            {q:'Which HTML tag is semantic for navigation?', opts:['<div>','<span>','<nav>','<menu>'], ans:2},
            {q:'Which unit is relative to viewport width?', opts:['px','em','vw','pt'], ans:2}
          ]},
        react: { title:'React', icon:'fa-brands fa-react', color:'#61DAFB',
          questions:[
            {q:'Which hook manages component state?', opts:['useEffect','useRef','useState','useMemo'], ans:2},
            {q:'What is JSX?', opts:['A template engine','JavaScript XML syntax','A CSS preprocessor','A build tool'], ans:1},
            {q:'How do you pass data to a child component?', opts:['State','Context','Props','Refs'], ans:2},
            {q:'What does useEffect return for cleanup?', opts:['A string','An object','A function','Nothing'], ans:2}
          ]},
        db: { title:'Databases', icon:'fa-solid fa-database', color:'#336791',
          questions:[
            {q:'Which SQL keyword retrieves data?', opts:['GET','FETCH','SELECT','RETRIEVE'], ans:2},
            {q:'What does a PRIMARY KEY ensure?', opts:['Null values','Unique + not null','Default value','Foreign link'], ans:1},
            {q:'Which JOIN returns all rows from both tables?', opts:['INNER JOIN','LEFT JOIN','RIGHT JOIN','FULL OUTER JOIN'], ans:3},
            {q:'What does WHERE filter?', opts:['Columns','Rows','Tables','Databases'], ans:1}
          ]},
        algo: { title:'Algorithms', icon:'fa-solid fa-diagram-project', color:'#FF6B6B',
          questions:[
            {q:'What is the time complexity of binary search?', opts:['O(n)','O(n log n)','O(log n)','O(1)'], ans:2},
            {q:'Which data structure uses FIFO?', opts:['Stack','Queue','Tree','Graph'], ans:1},
            {q:'What is the worst case of quicksort?', opts:['O(n)','O(n log n)','O(n²)','O(log n)'], ans:2},
            {q:'A stack uses which principle?', opts:['FIFO','LIFO','Random','Priority'], ans:1}
          ]}
    };

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Transaction = require('./models/Transaction');


const app = express();

app.use(express.json());
app.use(cors());

mongoose.connect('mongodb://localhost:27017/transactions');
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});


//saving transactions in DB
app.get('/api/init-db',async(req,res)=>{
   try {
    const fetchData = await fetch('https://s3.amazonaws.com/roxiler.com/product_transaction.json');
    const response = await fetchData.json();
    Transaction.deleteMany({});
    Transaction.insertMany(response);
    res.send({success:true,data:response});
   } catch (error) {
    res.status(500).send('Error initializing database');
   }
})

app.post('/api/transactions',async(req,res)=>{
    try {
        const { page, perPage, month, search } = req.body;
    
        const monthMap = {
          January: 1,
          February: 2,
          March: 3,
          April: 4,
          May: 5,
          June: 6,
          July: 7,
          August: 8,
          September: 9,
          October: 10,
          November: 11,
          December: 12,
        };
    
        const monthNumber = monthMap[month];
    
        if (!monthNumber) {
          return res.status(400).send('Invalid month');
        }
    
        // Base query: Matching transactions by the given month
        const query = {
          $expr: { $eq: [{ $month: '$dateOfSale' }, monthNumber] },
        };
    
        // Adding search condition if provided
        if (search) {
            const searchQuery = [
              { title: { $regex: search, $options: 'i' } },
              { description: { $regex: search, $options: 'i' } },
            ];
      
            // If the search is a number, addinh an exact match condition for the price
            if (!isNaN(search)) {
              searchQuery.push({ price: Number(search) });
            }
      
            query.$or = searchQuery;
        }
    
        // Fetching the paginated data
        const transactions = await Transaction.find(query)
          .skip((page - 1) * perPage)
          .limit(Number(perPage));
    
        // Geting total count for pagination
        const total = await Transaction.countDocuments(query);
        const totalPages = Math.ceil(total / perPage)
        // Sending the response
        res.json({success:true,data:transactions,totalPages});
      } catch (error) {
        res.status(500).send('Error fetching transactions');
    }
});


app.post('/api/statistics',async (req,res)=>{
    try {
        const { month } = req.body;
    
        const monthMap = {
          January: 1,
          February: 2,
          March: 3,
          April: 4,
          May: 5,
          June: 6,
          July: 7,
          August: 8,
          September: 9,
          October: 10,
          November: 11,
          December: 12,
        };
    
        const monthNumber = monthMap[month];
    
        if (!monthNumber) {
          return res.status(400).send('Invalid month');
        }
    
        const totalSale = await Transaction.aggregate([
            { 
              $match: { 
                $expr: { $eq: [{ $month: '$dateOfSale' }, monthNumber] } //getting specifc month's data
              } 
            },
            { //grouping the data
              $group: { 
                _id: null,
                totalSale: { $sum: '$price' },
                sold: { $sum: { $cond: [{ $eq: ['$sold', true] }, 1, 0] } },//calculating sum whenver sold is true
                notSold: { $sum: { $cond: [{ $eq: ['$sold', false] }, 1, 0] } }
              } 
            }
        ]);
          
    
   
    
        // Sending the response
        res.json({success:true,data:totalSale});
      } catch (error) {
        res.status(500).send('Error fetching statistics');
    }
})


app.post('/api/bar-chart', async (req, res) => {
    try {
      const { month } = req.body;
  
      const monthMap = {
        January: 1,
        February: 2,
        March: 3,
        April: 4,
        May: 5,
        June: 6,
        July: 7,
        August: 8,
        September: 9,
        October: 10,
        November: 11,
        December: 12,
      };
  
      const monthNumber = monthMap[month];
      if (!monthNumber) {
        return res.status(400).send('Invalid month');
      }
  
      const priceRanges = [
        { range: '0-100', min: 0, max: 100 },
        { range: '101-200', min: 101, max: 200 },
        { range: '201-300', min: 201, max: 300 },
        { range: '301-400', min: 301, max: 400 },
        { range: '401-500', min: 401, max: 500 },
        { range: '501-600', min: 501, max: 600 },
        { range: '601-700', min: 601, max: 700 },
        { range: '701-800', min: 701, max: 800 },
        { range: '801-900', min: 801, max: 900 },
        { range: '901-above', min: 901, max: Infinity },
      ];
  
      const result = [];
  
      for (let i=0;i<priceRanges.length;i++) {
        const count = await Transaction.countDocuments({
          $expr: { $eq: [{ $month: '$dateOfSale' }, monthNumber] }, // Matching the month
          price: { $gte: priceRanges[i]?.min, $lte: priceRanges[i]?.max }, // getting price greater than min and less than max
        });
  
        // Adding the result for this range
        result.push({ range:priceRanges[i]?.range,count });
      }
  
      res.json({success:true,data:result});
    } catch (error) {
      res.status(500).send('Error fetching bar chart data');
    }
});


app.post('/api/pie-chart', async (req, res) => {
    try {
      const { month } = req.body;
  
      const monthMap = {
        January: 1,
        February: 2,
        March: 3,
        April: 4,
        May: 5,
        June: 6,
        July: 7,
        August: 8,
        September: 9,
        October: 10,
        November: 11,
        December: 12,
      };
  
      const monthNumber = monthMap[month];
      if (!monthNumber) {
        return res.status(400).send('Invalid month');
      }
  
      // Counting the number of items in each category for the selected month
      const result = await Transaction.aggregate([
        {
          $match: {
            $expr: { $eq: [{ $month: '$dateOfSale' }, monthNumber] }, 
          },
        },
        {
          $group: {
            _id: '$category', 
            count: { $sum: 1 }, 
          },
        },
      ]);
  
      res.json({success:true,data:result});
    } catch (error) {
      res.status(500).send('Error fetching pie chart data');
    }
});


app.post('/api/combine',async(req,res)=>{
    try {
        const { month } = req.body;
    
        if (!month) {
          return res.status(400).json({ success: false, message: 'Month is required' });
        }
    
        // Calling the /api/pie-chart endpoint using fetch
        const first = await fetch('http://localhost:5000/api/pie-chart', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ month }),
        });
        const firstData = await first.json();
    
        if (!firstData) {
          return res.status(response.status).json({ success: false, message: 'Error fetching pie chart data' });
        }
        const second = await fetch('http://localhost:5000/api/bar-chart', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ month }),
          });
          const secondData = await second.json();
      
        if (!secondData) {
          return res.status(response.status).json({ success: false, message: 'Error fetching bar-chart data' });
        }
        const third = await fetch('http://localhost:5000/api/statistics', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ month }),
          });
          const thirdData = await third.json();
      
        if (!thirdData) {
          return res.status(response.status).json({ success: false, message: 'Error fetching statistics data' });
        }

        res.json({ success: true, firstData,secondData, thirdData});
      } catch (error) {
        res.status(500).json({ success: false, message: 'Error calling combine API' });
    }
})
  
  

app.listen('5000',()=>{
    console.log("server running.......")
})
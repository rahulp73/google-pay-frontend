// src/App.js
import React, { useState } from 'react';
import {
  Container,
  TextField,
  Button,
  Typography,
  Snackbar,
  CircularProgress,
} from '@mui/material';
import MuiAlert from '@mui/material/Alert';
import axios from 'axios';

function Alert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

function App() {
  const [phoneNum, setPhoneNum] = useState('');
  const [amount, setAmount] = useState('');
  const [toPhoneNum, setToPhoneNum] = useState('');
  const [initialAmount, setInitialAmount] = useState('');
  const [message, setMessage] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [showTransactions, setShowTransactions] = useState(false);

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpenSnackbar(false);
  };

  const handleLogin = async () => {
    setLoading(true);

    try {
      let response;

      // If initialAmount is provided, it's the first login with balance setup
      if (initialAmount !== '') {
        response = await axios.post('http://localhost:3001/api/user/login', {
          phoneNum,
          initialAmount: parseFloat(initialAmount),
        });
      } else {
        // Otherwise, it's a regular login
        response = await axios.post('http://localhost:3001/api/user/login', {
          phoneNum,
          initialAmount : 0
        });
      }

      if (response.data.user && response.data.user.availableAmount !== undefined) {
        setMessage(`Login successful. Available Amount: ${response.data.user.availableAmount}`);
      } else {
        setMessage(response.data.message);
      }

      // Fetch user transactions
      const transactionsResponse = await axios.get(
        `http://localhost:3001/api/user/transactions/${phoneNum}`
      );
      setTransactions(transactionsResponse.data.transactions);
      setShowTransactions(true);

      setOpenSnackbar(true);
    } catch (error) {
      setMessage('Error during login.');
      setOpenSnackbar(true);
    } finally {
      setLoading(false);
    }
  };

  const handleTransfer = async () => {
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:3001/api/user/transfer', {
        from: phoneNum,
        to: toPhoneNum,
        amount: parseFloat(amount),
      });
      console.log(response)
      setMessage(response.data.message);
      setOpenSnackbar(true);
    } catch (error) {
      setMessage('Error during transfer.');
      setOpenSnackbar(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" style={{ marginTop: '50px' }}>
      <Typography variant="h5" gutterBottom>
        Google Pay Clone
      </Typography>
      <TextField
        label="Phone Number"
        fullWidth
        margin="normal"
        value={phoneNum}
        onChange={(e) => setPhoneNum(e.target.value)}
      />
      <TextField
          label="Initial Balance"
          fullWidth
          margin="normal"
          type="number"
          value={initialAmount}
          onChange={(e) => setInitialAmount(e.target.value)}
        />
      <Button variant="contained" color="primary" onClick={handleLogin} disabled={loading}>
        {loading ? <CircularProgress size={24} /> : 'Login'}
      </Button>

      <TextField
        label="To Phone Number"
        fullWidth
        margin="normal"
        value={toPhoneNum}
        onChange={(e) => setToPhoneNum(e.target.value)}
      />
      <TextField
        label="Amount"
        fullWidth
        margin="normal"
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      <Button variant="contained" color="primary" onClick={handleTransfer} disabled={loading}>
        {loading ? <CircularProgress size={24} /> : 'Transfer'}
      </Button>

      <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={handleSnackbarClose}>
        <div><Alert onClose={handleSnackbarClose} severity="info">
          {message}
        </Alert></div>
      </Snackbar>
      {showTransactions && (
        <div>
          <Typography variant="h6" style={{ marginTop: '20px' }}>
            Transaction History:
          </Typography>
          <ul>
            {transactions.map((transaction, index) => (
              <li key={index}>
                {transaction.from} transferred {transaction.amount} to {transaction.to}{' '}
                {transaction.cashback !== undefined && `, Cashback: ${transaction.cashback}`}
              </li>
            ))}
          </ul>
        </div>
      )}
    </Container>
  );
}

export default App;



'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

// Data
const account1 = {
    owner: 'Jonas Schmedtmann',
    movements: [200, 450, -400, 3000, -650, -130, 70, 1300],
    interestRate: 1.2, // %
    pin: 1111,
};

const account2 = {
    owner: 'Jessica Davis',
    movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
    interestRate: 1.5,
    pin: 2222,
};

const account3 = {
    owner: 'Steven Thomas Williams',
    movements: [200, -200, 340, -300, -20, 50, 400, -460],
    interestRate: 0.7,
    pin: 3333,
};

const account4 = {
    owner: 'Sarah Smith',
    movements: [430, 1000, 700, 50, 90],
    interestRate: 1,
    pin: 4444,
};

const accounts = [account1, account2, account3, account4];

// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

const popup = document.querySelector('.popup_access');

const popupAllow = function() {
    popup.style.color = 'rgb(51, 255, 0)';
    popup.textContent = 'ACCESS ALLOW';
    popup.style.display = 'flex';
    popup.style.opacity = 100;
    containerApp.style.opacity = 0;
    setTimeout(function() {
        popup.style.opacity = 0;
        popup.style.display = 'none';
        containerApp.style.opacity = 100;
    }, 1500);
}

const popupDenied = function() {
    popup.style.color = 'rgb(255, 0, 0)';
    popup.textContent = 'ACCESS DENIED';
    popup.style.opacity = 100;
    popup.style.display = 'flex';
    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur();
    inputLoginUsername.blur();
    containerApp.style.opacity = 0;
    setTimeout(function() {
        popup.style.opacity = 0;
        popup.style.display = 'none';
    }, 1500);
}

const displayMovements = function(movements, sort = false) {
    containerMovements.innerHTML = '';

    const movs = sort ? movements.slice().sort((a, b) => a - b) : movements;

    movs.forEach(function(mov, i) {
        const type = mov > 0 ? 'deposit' : 'withdrawal';
        const html = `
        <div class="movements__row">
          <div class="movements__type movements__type--${type}">${i + 1} ${type}</div>
          <div class="movements__value">${mov}€</div>
        </div>
        `;

        containerMovements.insertAdjacentHTML("afterbegin", html);

    });
}

const calcDisplayBalance = function(acc) {
    acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0);
    labelBalance.textContent = `${acc.balance} €`;

};

const calcDisplaySummary = function(acc) {
    const incomes = acc.movements
        .filter(mov => mov > 0)
        .reduce((acc, mov) => acc + mov, 0);
    labelSumIn.textContent = `${incomes}€`;

    const out = acc.movements
        .filter(mov => mov < 0)
        .reduce((acc, mov) => acc + mov, 0);
    labelSumOut.textContent = `${Math.abs(out)}€`;

    const interest = acc.movements
        .filter(mov => mov > 0)
        .map(deposit => (deposit * currentAccount.interestRate) / 100)
        .filter((int, i, arr) => { //tikai ja lielāks par 1eur   
            // console.log(arr)
            return int >= 1;
        })
        .reduce((acc, int) => acc + int, 0);
    labelSumInterest.textContent = `${interest}€`;
}


const creatUsernames = function(accs) {
    accs.forEach(function(acc) {

        acc.username = acc.owner
            .toLowerCase()
            .split(' ')
            .map(name => name[0])
            .join('');
    });
};
creatUsernames(accounts);

const updateUI = function(acc) {
    //display movements, balance, summary
    displayMovements(acc.movements);
    calcDisplayBalance(acc);
    calcDisplaySummary(acc);
}

let currentAccount

btnLogin.addEventListener('click', function(e) {
    e.preventDefault();
    currentAccount = accounts.find(acc => acc.username === inputLoginUsername.value);
    console.log(currentAccount);

    if (currentAccount && currentAccount.pin === Number(inputLoginPin.value)) {
        popupAllow();
        //dispaly UI and massage
        labelWelcome.textContent = `Welcome back, ${currentAccount.owner.split(' ')[0]}`
            // containerApp.style.opacity = 100;
            // clear input fields
        inputLoginUsername.value = inputLoginPin.value = '';
        inputLoginPin.blur();
        inputLoginUsername.blur();


        //display movements, balance, summary

        updateUI(currentAccount);

        // console.log(currentAccount.interestRate);

    } else {
        popupDenied();
    }
})

btnTransfer.addEventListener('click', function(e) {
    e.preventDefault();
    const amount = Number(inputTransferAmount.value);
    const receiverAcc = accounts.find(acc => acc.username === inputTransferTo.value);
    // console.log(amount, receiverAcc)
    inputTransferAmount.value = inputTransferTo.value = '';

    if (amount > 0 && receiverAcc &&
        currentAccount.balance >= amount &&
        receiverAcc.username !== currentAccount.username) {
        //doing the transfer
        currentAccount.movements.push(-amount);
        receiverAcc.movements.push(amount);

        updateUI(currentAccount);

    }
});

btnLoan.addEventListener('click', function(e) {
    e.preventDefault();

    const amount = Number(inputLoanAmount.value);
    if (amount > 0 && currentAccount.movements.some(mov => mov >= amount * 0.1)) {
        //add movement
        currentAccount.movements.push(amount);

        //update UI
        updateUI(currentAccount)
    }
    inputLoanAmount.value = '';
    inputLoanAmount.blur();
})

btnClose.addEventListener('click', function(e) {
    e.preventDefault();
    if (currentAccount.username === inputCloseUsername.value &&
        Number(inputClosePin.value) === currentAccount.pin) {
        const index = accounts.findIndex(acc => acc.username === currentAccount.username);
        accounts.splice(index, 1);
        containerApp.style.opacity = 0;
    }
    inputCloseUsername.value = inputClosePin.value = '';
})
let sorted = false;
btnSort.addEventListener('click', function(e) {
    e.preventDefault();
    displayMovements(currentAccount.movements, !sorted);
    sorted = !sorted;
});



/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES

// const currencies = new Map([
//     ['USD', 'United States dollar'],
//     ['EUR', 'Euro'],
//     ['GBP', 'Pound sterling'],
// ]);

// const movements = [200, 450, -400, 3000, -650, -130, 70, 1300];

/////////////////////////////////////////////////

// const checkDogs = function(dogsJulia, dogsKate) {
//     const dogsJuliaCorrected = dogsJulia.slice();
//     dogsJuliaCorrected.splice(0, 1)
//     dogsJuliaCorrected.splice(-2);
//     const dogs = dogsJuliaCorrected.concat(dogsKate);

//     dogs.forEach(function(dog, i) {
//         if (dog > 3) {
//             console.log(`Dog number ${i + 1} is an adult, and is ${dog} years old.`)
//         } else {
//             console.log(`Dog number ${i + 1} is still a puppy 🐶
//           `)
//         }
//     })

// };

// checkDogs([3, 5, 2, 12, 7], [4, 1, 15, 8, 3]);

// const ages1 = [5, 2, 4, 1, 15, 8, 3];
// const ages2 = [16, 6, 10, 5, 6, 1, 4];

// const calcAverageHumanAge2 = function(ages) {
//     const humanAges = ages.map(age => (age <= 2 ? 2 * age : 16 + age * 4));
//     // const humanAges = ages.map(function(age) {
//     //     if (age <= 2) {
//     //         return 2 * age
//     //     } else {
//     //         return 16 + age * 4
//     //     };
//     // });
//     console.log(humanAges);
//     const adults = humanAges.filter(age => age >= 18);
//     console.log(adults);
//     const average = adults.reduce((acc, age) => acc + age / adults.length, 0);
//     // return average;
//     console.log(average);
// }

// const calcAverageHumanAge = ages => ages
//     .map(age => (age <= 2 ? 2 * age : 16 + age * 4))
//     .filter(age => age >= 18)
//     .reduce((acc, age, i, arr) => acc + age / arr.length, 0);



// const avg1 = calcAverageHumanAge([5, 2, 4, 1, 15, 8, 3]);
// const avg2 = calcAverageHumanAge([16, 6, 10, 5, 6, 1, 4]);
// console.log(avg1, avg2)

// const eurToUsd = 1.1;
// console.log(account1.movements);

// const totalDepositsUSD = account1.movements
//     .filter(mov => mov > 0)
//     .map(mov => mov * eurToUsd)
//     .reduce((acc, mov) => acc + mov, 0);
// console.log(totalDepositsUSD);
let exchangeRate = 7.2; // 默认汇率（USD => CNY）

async function fetchExchangeRate() {
    try {
        const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
        const data = await response.json();
        exchangeRate = data.rates.CNY;
        document.getElementById('exchange_rate').innerText = exchangeRate.toFixed(2);
    } catch (error) {
        console.error("Failed to fetch exchange rate. Using default:", error);
        document.getElementById('exchange_rate').innerText = exchangeRate.toFixed(2);
    }
}

fetchExchangeRate();

function convertCurrency(fromCurrency) {
    const usdInput = document.getElementById('usd_amount');
    const cnyInput = document.getElementById('cny_amount');

    if (fromCurrency === 'usd') {
        const usdValue = parseFloat(usdInput.value);
        if (!isNaN(usdValue)) {
            cnyInput.value = (usdValue * exchangeRate).toFixed(2);
        }
    } else if (fromCurrency === 'cny') {
        const cnyValue = parseFloat(cnyInput.value);
        if (!isNaN(cnyValue)) {
            usdInput.value = (cnyValue / exchangeRate).toFixed(2);
        }
    }
}

async function getBankDeposits() {
    const bankName = document.getElementById('query_deposit_bank_name').value;
    
    if (!bankName) {
        alert("Please enter a bank name.");
        return;
    }

    const response = await fetch(`http://121.43.53.190:5000/bank_deposits?bank_name=${bankName}`);
    
    if (response.ok) {
        const result = await response.json();

        const table = document.getElementById('deposit_table');
        table.innerHTML = `
            <tr>
                <th>Principal (USD)</th>
                <th>Principal (CNY)</th>
                <th>Interest_rate (%)</th>
                <th>Interest (USD)</th>
                <th>Interest (CNY)</th>
                <th>Deposit Date</th>
            </tr>
        `;

        // 如果没有数据，显示提示并返回
        if (result.deposits.length === 0) {
            table.innerHTML += `
                <tr>
                    <td colspan="6" style="text-align: center;">No deposits found for this bank.</td>
                </tr>
            `;
            document.getElementById('total_deposit').innerHTML = `
                <span class="title">Summary:</span>
                <span>Total principal: USD <b>0</b>, CNY <b>0</b></span><br>
                <span>Total interest: USD <b>0</b>, CNY <b>0</b></span><br>
                <span>Total amount: USD <b>0</b>, CNY <b>0</b></span>
            `;
            return;
        }

        // 如果有数据，填充表格和汇总信息
        result.deposits.forEach(deposit => {
            const row = table.insertRow();
            row.innerHTML = `
                <td>${deposit.amount_usd}</td>
                <td>${deposit.amount_cny}</td>
                <td>${deposit.interest_rate}</td>
                <td>${deposit.interest_usd}</td>
                <td>${deposit.interest_cny}</td>
                <td>${deposit.deposit_date}</td>
            `;
        });

        document.getElementById('total_deposit').innerHTML = `
            <span class="title">Summary:</span>
            <span>Total principal: USD <b>${result.total_principal_usd}</b>, CNY <b>${result.total_principal_cny}</b></span><br>
            <span>Total interest: USD <b>${result.total_interest_usd}</b>, CNY <b>${result.total_interest_cny}</b></span><br>
            <span>Total amount: USD <b>${result.total_amount_usd}</b>, CNY <b>${result.total_amount_cny}</b></span>
        `;
    } else {
        alert("Failed to fetch data. Please try again later.");
    }
}

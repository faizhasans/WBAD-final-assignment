const carData = [
    {
        id: 'avanza',
        name: 'Toyota Avanza',
        price: 500000,
        image: 'assets/img/avanza.png'
    },
    {
        id: 'innova',
        name: 'Toyota Kijang Innova',
        price: 700000,
        image: 'assets/img/innova.png'
    },
    {
        id: 'hrv',
        name: 'Honda HRV',
        price: 600000,
        image: 'assets/img/hrv.jpg'
    },
    {
        id: 'sigra',
        name: 'Daihatsu Sigra',
        price: 450000,
        image: 'assets/img/sigra.jpg'
    }
];

const carListContainer = document.querySelector('.car-list');

const calculateBtn = document.getElementById('calculate-btn');
const saveBtn = document.getElementById('save-btn');

const customerNameInput = document.getElementById('customer-name');

const summaryDetails = document.getElementById('summary-details');
const totalPrice = document.getElementById('total-price');

const historyList = document.getElementById('history-list');

let currentOrder = {};

function renderCarList() {
    let carListHtml = '';
    carData.forEach(car => {
        carListHtml += `
            <div class="car-card" id="`+car.id+`">
                <img src="`+car.image+`" alt="`+car.name+`">
                <h3>`+car.name+`</h3>
                <p>Harga: `+car.price.toLocaleString('id-ID')+`/hari</p>
                <div class="car-controls">
                    <input type="checkbox" name="select-`+car.id+`" id="select-`+car.id+`" data-price="`+car.price+`">
                    <label for="select-`+car.id+`">Pilih Mobil Ini</label>
                    <input type="date" id="date-`+car.id+`" class="rental-input"> <input type="number" id="duration-`+car.id+`" class="rental-input" placeholder="Durasi (hari)" min="1"></div>
                </div>
            </div>
        `;
    });
    carListContainer.innerHTML = carListHtml;
}

function addCardClickListeners() {
    const carCards = document.querySelectorAll('.car-card');
    carCards.forEach(card => {
        card.addEventListener('click', (event) => {
            if (event.target.tagName === 'INPUT' || event.target.tagName === 'LABEL') {
                return;
            }

            const checkbox = card.querySelector('input[type="checkbox"]');
            checkbox.checked = !checkbox.checked;
        });
    });
}

function calculateTotal() {
    let total = 0;
    let summaryHtml = '<ul>';
    let selectedCars = [];

    const customerName = customerNameInput.value.trim();
    if(!customerName) {
        alert('Silakan masukkan nama pelanggan.');
        return;
    }

    carData.forEach(car => {
        const checkbox = document.getElementById('select-'+car.id);

        if(checkbox.checked) {
            const duration = parseInt(document.getElementById('duration-'+car.id).value);
            const startDate = document.getElementById('date-'+car.id).value;
            const price = parseInt(checkbox.dataset.price);

            if (duration > 0 && startDate) {
                const subTotal = duration * price;

                total += subTotal;
                summaryHtml += `<li>`+car.name+` (Durasi:`+duration+` hari) - <strong>Rp `+subTotal.toLocaleString('id-ID')+`</strong></li>`;

                selectedCars.push({
                    name: car.name,
                    startDate: startDate,
                    duration: duration,
                    subTotal: subTotal
                });
            } else {
                alert('Silakan isi tanggal mulai sewa dan durasi untuk '+car.name+'!');
                selectedCars = [];
                return;
            }
        }
    });

    summaryHtml += '</ul>';

    if(selectedCars.length > 0){
        summaryDetails.innerHTML = summaryHtml;
        totalPrice.textContent = 'Rp'+total.toLocaleString('id-ID');
        saveBtn.style.display = 'inline-block';

        currentOrder = {
            cars: selectedCars,
            totalPrice: total
        };
    } else {
        summaryDetails.innerHTML = '<p>Anda belum memilih mobil atau melengkapi data sewa.</p>';
        totalPrice.textContent = 'Rp0';
        saveBtn.style.display = 'none';
    }
}

function saveBooking() {
    const customerName = customerNameInput.value.trim();
    if(!customerName) {
        alert('Silakan masukkan nama pelanggan.');
        return;
    }

    if(!currentOrder.cars || currentOrder.cars.length == 0) {
        alert('Tidak ada data untuk disimpan. Harap hitung total terlebih dahulu.');
        return;
    }

    const newBooking = {
        id: Date.now(),
        timestamp: new Date().toLocaleString('id-ID'),
        customerName: customerName,
        ...currentOrder
    };

    const bookings = JSON.parse(localStorage.getItem('carBookings')) || [];
    bookings.push(newBooking);
    localStorage.setItem('carBookings', JSON.stringify(bookings));

    alert('Pemesanan berhasil disimpan!');
    displayBookings();
    resetForm();
}

function displayBookings() {
    const bookings = JSON.parse(localStorage.getItem('carBookings')) || [];
    if (bookings.length === 0) {
        historyList.innerHTML = '<p>Belum ada riwayat pemesanan.</p>';
        return;
    }

    let historyHtml = '';
    for (let i = 0; i < bookings.length; i++) {
        const booking = bookings[i];
        
        let carsHtml = '';
        for (let j = 0; j < booking.cars.length; j++) {
            const car = booking.cars[j];
            carsHtml += `<li>`+car.name+` (`+car.duration+` hari) - Rp `+car.subTotal.toLocaleString('id-ID')+`</li>`;
        }
        
        historyHtml += `
            <div class="history-item">
                <div class="details">
                    <strong>Pemesanan oleh:`+booking.customerName+`</strong>
                    <p>Waktu Pesan: `+booking.timestamp+`</p>
                    <ul>
                        `+carsHtml+`
                    </ul>
                    <p><strong>Total: Rp `+booking.totalPrice.toLocaleString('id-ID')+`</strong></p>
                </div>
                <button class="delete-btn" data-id="`+booking.id+`">Hapus</button>
            </div>
        `;
    }
    historyList.innerHTML = historyHtml;
}

function deleteBooking(e) {
    if (e.target.classList.contains('delete-btn')) {
        const bookingId = parseInt(e.target.dataset.id);
        let bookings = JSON.parse(localStorage.getItem('carBookings')) || [];
        bookings = bookings.filter(booking => booking.id !== bookingId);
        localStorage.setItem('carBookings', JSON.stringify(bookings));
        displayBookings();
    }
}

function resetForm() {
    customerNameInput.value = '';
    carData.forEach(car => {
        document.getElementById(`select-`+car.id).checked = false;
        document.getElementById(`date-`+car.id).value = '';
        document.getElementById(`duration-`+car.id).value = '';
    });
    summaryDetails.innerHTML = '<p>Silakan pilih mobil dan klik "Hitung Total".</p>';
    totalPrice.textContent = 'Rp 0';
    saveBtn.style.display = 'none';
    currentOrder = {};
}

calculateBtn.addEventListener('click', calculateTotal);
saveBtn.addEventListener('click', saveBooking);
historyList.addEventListener('click', deleteBooking);

renderCarList();
addCardClickListeners();
displayBookings();
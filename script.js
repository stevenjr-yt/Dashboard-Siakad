// script.js

const STORAGE_KEY = 'dataMahasiswaDarmajaya';

// --- FUNGSI LOCAL STORAGE ---
function getDataFromStorage() {
    const dataString = localStorage.getItem(STORAGE_KEY);
    return dataString ? JSON.parse(dataString) : [];
}

function saveDataToStorage(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}
// ----------------------------

let dataMahasiswa = getDataFromStorage();
const form = document.getElementById("formMahasiswa");
const tabelBody = document.querySelector("#tabelMahasiswa tbody");

/**
 * Membuat NPM (Nomor Pokok Mahasiswa) Otomatis: 241101xx
 */
function generateNPM() {
    // Ambil data terbaru dari storage untuk hitungan
    const currentData = getDataFromStorage();
    // Cari NPM terbesar atau hitung jumlah data
    const lastIndex = currentData.length + 1;
    // Format nomor urut menjadi 2 digit (01, 02, ...)
    const newIndex = String(lastIndex).padStart(2, '0'); 
    
    // Format Tahun Masuk (24) + Kode Prodi (1101) + Nomor Urut (xx)
    // Di sini saya membuat contoh format NPM: Tahun(24) + Kode_Khusus(00) + Urutan(xx)
    return `241101${newIndex}`; 
}

/**
 * Menambahkan event listener untuk submit form
 */
if (form) {
    form.addEventListener("submit", function(e) {
        e.preventDefault();
        
        // Ambil nilai dari input
        const nama = document.getElementById("nama").value.trim();
        const tanggal_lahir = document.getElementById("tanggal_lahir").value; // Format YYYY-MM-DD
        const jurusan = document.getElementById("jurusan").value;

        // Validasi sederhana
        if (nama && tanggal_lahir && jurusan) {
            const npm = generateNPM();
            
            // Format password: DD-MM-YYYY (diambil dari tanggal_lahir)
            const parts = tanggal_lahir.split('-');
            const password = `${parts[2]}-${parts[1]}-${parts[0]}`; // DD-MM-YYYY

            const newData = { 
                nama, 
                npm, 
                tanggal_lahir, 
                jurusan,
                username: npm, // Username Siakad = NPM
                password: password // Password Siakad = Tanggal Lahir (DD-MM-YYYY)
            };

            dataMahasiswa.push(newData);
            saveDataToStorage(dataMahasiswa); 
            form.reset();
            alert(`Pendaftaran Berhasil! NPM Anda: ${npm}. Password Siakad: ${password}.`);
            
            // Opsional: Jika halaman admin terbuka, refresh tabelnya
            if (window.opener && window.opener.tampilkanData) {
                 window.opener.tampilkanData();
            }

        } else {
            alert("Semua kolom wajib diisi.");
        }
    });
}

/**
 * Fungsi untuk menghapus data mahasiswa berdasarkan NPM
 * Dipanggil dari tombol di tabel (hanya tersedia di admin dashboard)
 */
window.hapusData = function(npmToDelete) {
    // Cek apakah admin sudah login (diberi flag di Local Storage)
    if (localStorage.getItem('isAdminLoggedIn') !== 'true') {
        alert("Akses ditolak! Fitur hapus hanya untuk Administrator.");
        return;
    }

    if (confirm(`ADMIN: Apakah Anda yakin ingin menghapus data mahasiswa dengan NPM ${npmToDelete}?`)) {
        dataMahasiswa = dataMahasiswa.filter(mhs => mhs.npm !== npmToDelete);
        saveDataToStorage(dataMahasiswa);
        tampilkanData(); // Refresh tabel admin
        alert(`Data NPM ${npmToDelete} berhasil dihapus oleh Admin.`);
    }
};

/**
 * Fungsi untuk menampilkan data mahasiswa ke dalam tabel.
 * Fungsi ini akan dipanggil di halaman admin_dashboard.html
 */
window.tampilkanData = function() {
    if (!tabelBody) return; // Hentikan jika tabel tidak ditemukan (cth: di index.html)

    dataMahasiswa = getDataFromStorage(); 
    
    tabelBody.innerHTML = "";
    
    // Cek status Admin (untuk menampilkan/menyembunyikan tombol hapus)
    const isAdmin = localStorage.getItem('isAdminLoggedIn') === 'true';

    const tabelHeader = document.querySelector('#tabelMahasiswa thead th:last-child');
    if (tabelHeader) {
        tabelHeader.textContent = isAdmin ? 'Aksi (Admin)' : 'Aksi (Non-Admin)';
    }


    if (dataMahasiswa.length === 0) {
        const emptyRow = `<tr><td colspan="6">Belum ada data mahasiswa yang ditambahkan.</td></tr>`;
        tabelBody.innerHTML = emptyRow;
        return;
    }

    dataMahasiswa.forEach((mhs, index) => {
        // Format tanggal lahir ke DD/MM/YYYY
        const tglLahir = mhs.tanggal_lahir ? mhs.tanggal_lahir.split('-').reverse().join('/') : '-';
        
        const row = `<tr>
            <td>${index + 1}</td>
            <td>${mhs.nama}</td>
            <td>${mhs.npm}</td>
            <td>${tglLahir}</td>
            <td>${mhs.jurusan}</td>
            <td class="table-actions">
                ${isAdmin 
                    ? `<button class="delete-btn" onclick="hapusData('${mhs.npm}')">Hapus</button>`
                    : `<span>-</span>`
                }
            </td>
        </tr>`;
        tabelBody.innerHTML += row;
    });
}

// Catatan: tampilkanData() tidak dipanggil secara otomatis di script.js
// karena sudah dihapus dari index.html. Panggilan akan dilakukan di admin_dashboard.html.
// Ambil elemen HTML yang akan dipakai oleh JavaScript.
const formulirTugas = document.querySelector("#formulir-tugas");
const inputJudul = document.querySelector("#judul-tugas");
const inputMatkul = document.querySelector("#matkul-tugas");
const inputTenggat = document.querySelector("#tanggal-tenggat");
const daftarTugas = document.querySelector("#daftar-tugas");
const tampilanKosong = document.querySelector("#tampilan-kosong");
const pesan = document.querySelector("#pesan");

const jumlahTotal = document.querySelector("#jumlah-total");
const jumlahBelumSelesai = document.querySelector("#jumlah-belum-selesai");
const jumlahDekat = document.querySelector("#jumlah-dekat");
const jumlahDiDaftar = document.querySelector("#jumlah-di-daftar");

// Semua tugas disimpan dalam array ini selama halaman dibuka.
let daftar = [];

// Mengubah tanggal hari ini ke format yang cocok untuk input tanggal.
function tanggalHariIni() {
  const hariIni = new Date();
  const tahun = hariIni.getFullYear();
  const bulan = String(hariIni.getMonth() + 1).padStart(2, "0");
  const tanggal = String(hariIni.getDate()).padStart(2, "0");

  return `${tahun}-${bulan}-${tanggal}`;
}

// Menghitung jarak hari antara hari ini dan tanggal tenggat.
function hitungSisaHari(tanggal) {
  const bagianTanggal = tanggal.split("-").map(Number);
  const tenggat = new Date(bagianTanggal[0], bagianTanggal[1] - 1, bagianTanggal[2]);
  const bagianHariIni = tanggalHariIni().split("-").map(Number);
  const hariIni = new Date(bagianHariIni[0], bagianHariIni[1] - 1, bagianHariIni[2]);

  return Math.round((tenggat - hariIni) / (1000 * 60 * 60 * 24));
}

// Menulis tanggal dengan format yang mudah dibaca.
function tampilkanTanggal(tanggal) {
  const bagianTanggal = tanggal.split("-").map(Number);
  const tanggalObjek = new Date(bagianTanggal[0], bagianTanggal[1] - 1, bagianTanggal[2]);

  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric"
  }).format(tanggalObjek);
}

// Menyimpan daftar tugas agar tetap ada setelah halaman ditutup.
function simpanTugas() {
  try {
    localStorage.setItem("temanDeadlineTasks", JSON.stringify(daftar));
    pesan.textContent = "";
    pesan.classList.remove("is-visible");
  } catch (kesalahan) {
    console.error("Tugas tidak dapat disimpan.", kesalahan);
    pesan.textContent = "Tugas belum tersimpan. Periksa pengaturan penyimpanan browser.";
    pesan.classList.add("is-visible");
  }
}

// Membuat satu tampilan tugas beserta tombol selesai dan hapus.
function buatTampilanTugas(tugas) {
  const kartu = document.createElement("article");
  const tombolSelesai = document.createElement("button");
  const informasi = document.createElement("div");
  const judul = document.createElement("p");
  const matkul = document.createElement("p");
  const bagianTenggat = document.createElement("div");
  const tanggal = document.createElement("span");
  const labelTenggat = document.createElement("span");
  const tombolHapus = document.createElement("button");
  const sisaHari = hitungSisaHari(tugas.tenggat);

  kartu.className = tugas.selesai ? "task-item is-complete" : "task-item";

  tombolSelesai.className = "complete-button";
  tombolSelesai.type = "button";
  tombolSelesai.textContent = "✓";
  tombolSelesai.setAttribute(
    "aria-label",
    tugas.selesai ? "Tandai belum selesai" : "Tandai selesai"
  );
  tombolSelesai.addEventListener("click", function () {
    tugas.selesai = !tugas.selesai;
    simpanTugas();
    tampilkanSemuaTugas();
  });

  informasi.className = "task-copy";
  judul.className = "task-title";
  judul.textContent = tugas.judul;
  matkul.className = "task-course";
  matkul.textContent = tugas.matkul || "Mata kuliah belum diisi";
  informasi.append(judul, matkul);

  bagianTenggat.className = "task-meta";
  tanggal.className = "task-date";
  tanggal.textContent = tampilkanTanggal(tugas.tenggat);
  labelTenggat.className = "deadline-badge";

  if (tugas.selesai) {
    labelTenggat.textContent = "Selesai";
  } else if (sisaHari < 0) {
    labelTenggat.classList.add("is-overdue");
    labelTenggat.textContent = `Terlambat ${Math.abs(sisaHari)} hari`;
  } else if (sisaHari === 0) {
    labelTenggat.classList.add("is-today");
    labelTenggat.textContent = "Hari ini";
  } else if (sisaHari === 1) {
    labelTenggat.classList.add("is-tomorrow");
    labelTenggat.textContent = "Besok";
  } else {
    labelTenggat.textContent = `${sisaHari} hari lagi`;
  }

  bagianTenggat.append(tanggal, labelTenggat);

  tombolHapus.className = "delete-button";
  tombolHapus.type = "button";
  tombolHapus.textContent = "×";
  tombolHapus.setAttribute("aria-label", `Hapus tugas ${tugas.judul}`);
  tombolHapus.addEventListener("click", function () {
    daftar = daftar.filter(function (item) {
      return item.id !== tugas.id;
    });
    simpanTugas();
    tampilkanSemuaTugas();
  });

  kartu.append(tombolSelesai, informasi, bagianTenggat, tombolHapus);
  return kartu;
}

// Menampilkan ulang daftar dan memperbarui angka ringkasan.
function tampilkanSemuaTugas() {
  daftarTugas.replaceChildren();

  let belumSelesai = 0;
  let tenggatDekat = 0;

  daftar.forEach(function (tugas) {
    daftarTugas.append(buatTampilanTugas(tugas));

    if (!tugas.selesai) {
      belumSelesai += 1;
      if (hitungSisaHari(tugas.tenggat) <= 3) {
        tenggatDekat += 1;
      }
    }
  });

  jumlahTotal.textContent = daftar.length;
  jumlahBelumSelesai.textContent = belumSelesai;
  jumlahDekat.textContent = tenggatDekat;
  jumlahDiDaftar.textContent = `${daftar.length} tugas`;
  tampilanKosong.hidden = daftar.length > 0;
}

// Membaca tugas dari browser. Format lama tetap dibaca agar data tidak hilang.
function muatTugas() {
  try {
    const dataTersimpan = localStorage.getItem("temanDeadlineTasks");

    if (dataTersimpan) {
      const tugasTersimpan = JSON.parse(dataTersimpan);
      if (!Array.isArray(tugasTersimpan)) {
        throw new Error("Data tugas bukan berupa daftar.");
      }

      daftar = tugasTersimpan.map(function (tugas) {
        return {
          id: tugas.id || String(Date.now() + Math.random()),
          judul: tugas.judul || tugas.title || "",
          matkul: tugas.matkul || tugas.course || "",
          tenggat: tugas.tenggat || tugas.dueDate || "",
          selesai: tugas.selesai === undefined ? Boolean(tugas.completed) : tugas.selesai
        };
      });
    }
  } catch (kesalahan) {
    console.error("Tugas tersimpan tidak dapat dibaca.", kesalahan);
    pesan.textContent = "Tugas tersimpan tidak dapat dibaca. Periksa data situs di browser.";
    pesan.classList.add("is-visible");
  }

  tampilkanSemuaTugas();
}

// Tanggal yang bisa dipilih dimulai dari hari ini.
inputTenggat.min = tanggalHariIni();

// Saat formulir dikirim, buat tugas baru lalu simpan dan tampilkan.
formulirTugas.addEventListener("submit", function (acara) {
  acara.preventDefault();

  const judul = inputJudul.value.trim();
  const matkul = inputMatkul.value.trim();
  const tenggat = inputTenggat.value;

  if (!judul || !tenggat) {
    pesan.textContent = "Isi nama tugas dan tanggal deadline terlebih dahulu.";
    pesan.classList.add("is-visible");
    return;
  }

  if (tenggat < tanggalHariIni()) {
    pesan.textContent = "Tanggal deadline tidak boleh sebelum hari ini.";
    pesan.classList.add("is-visible");
    return;
  }

  daftar.push({
    id: String(Date.now()),
    judul: judul,
    matkul: matkul,
    tenggat: tenggat,
    selesai: false
  });

  simpanTugas();
  tampilkanSemuaTugas();
  formulirTugas.reset();
  inputTenggat.min = tanggalHariIni();
  inputJudul.focus();
});

// Jalankan saat halaman pertama kali dibuka.
muatTugas();

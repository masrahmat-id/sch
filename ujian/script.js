const API_URL = "https://script.google.com/macros/s/AKfycbxMZJNCGYeDiCphTRQKvbiXdtSzkUfZlhAJnprN2z10En0yVpkfwkjqxzNL_BrEgRejYQ/exec"; // URL Web App

let siswa = null;
let soalData = [];

/* ===== LOGIN ===== */
function login() {
  const nisn = document.getElementById("nisn").value;
  fetch(`${API_URL}?action=login&nisn=${nisn}`)
    .then(res => res.json())
    .then(data => {
      if(data.status === "success") {
        siswa = data;
        localStorage.setItem("siswa", JSON.stringify(siswa));
        window.location.href = "https://masrahmat-id.github.io/sch/ujian/ujian.html";
      } else {
        document.getElementById("pesan").innerText = "NISN tidak ditemukan!";
      }
    });
}

/* ===== LOAD HALAMAN UJIAN ===== */
window.onload = function() {
  if(document.getElementById("infoSiswa")) {
    siswa = JSON.parse(localStorage.getItem("siswa"));
    if(!siswa) { window.location.href = "https://masrahmat-id.github.io/sch/ujian/index.html"; return; }

    document.getElementById("infoSiswa").innerText = `${siswa.nama} - Kelas ${siswa.kelas}`;

    // Daftar mapel sesuai kelas
    const mapelSelect = document.getElementById("mapel");
    let mapel = ["MATEMATIKA","IPA","B.INDONESIA","B.INGGRIS"]; // Contoh, sesuaikan mapel sebenarnya
    mapel.forEach(m => {
      const option = document.createElement("option");
      option.value = m; option.text = m;
      mapelSelect.appendChild(option);
    });
  }
}

/* ===== AMBIL SOAL ===== */
function loadSoal() {
  const mapel = document.getElementById("mapel").value;
  if(!mapel) return;

  fetch(`${API_URL}?action=soal&kelas=${siswa.kelas}&mapel=${mapel}`)
    .then(res => res.json())
    .then(data => {
      soalData = data;
      renderSoal();
    });
}

function renderSoal() {
  const container = document.getElementById("soalContainer");
  container.innerHTML = "";

  soalData.forEach((s, idx) => {
    const div = document.createElement("div");
    div.innerHTML = `<p>${s.no}. ${s.soal}</p>`;
    for(let key in s.opsi) {
      div.innerHTML += `<label><input type="radio" name="soal${idx}" value="${key}"> ${key}. ${s.opsi[key]}</label><br>`;
    }
    container.appendChild(div);
  });
}

/* ===== SUBMIT UJIAN ===== */
function submitUjian() {
  const mapel = document.getElementById("mapel").value;
  if(!mapel) return alert("Pilih mapel dulu");

  const jawaban = soalData.map((s, idx) => {
    const radios = document.getElementsByName("soal"+idx);
    for(let r of radios) if(r.checked) return r.value;
    return ""; // kosong jika tidak dijawab
  });

  fetch(API_URL, {
    method: "POST",
    body: JSON.stringify({
      nisn: siswa.nisn,
      nama: siswa.nama,
      kelas: siswa.kelas,
      mapel: mapel,
      jawaban: jawaban
    })
  })
  .then(res => res.json())
  .then(data => {
    document.getElementById("nilai").innerText = `Nilai Anda: ${data.nilai}`;
  });
}

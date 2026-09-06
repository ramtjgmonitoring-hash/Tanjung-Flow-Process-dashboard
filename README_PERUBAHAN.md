# Dashboard 3D Tanjung V10 - Pemisahan Data Integrasi & Equipment Database

## Perubahan utama
1. **Data Integrasi / Input Parameter** dipindahkan ke tabel khusus pada dashboard utama.
   - Gross Inlet tiap Block Station
   - Water Production WTP
   - Water Cut SPU MNGL
   - Injection Efficiency WIP
   - Source data: Manual / SCADA / Historian / Calculated
2. Nilai pada PFD sekarang **read-only**, sehingga tidak tercampur dengan fungsi master database equipment.
3. **Equipment Database** tetap terpisah per station dan fokus pada spesifikasi teknis:
   - Pump: Tag ID, Type, Model/Service, Design Capacity, Rated Head, Motor Power, Material, Status
   - Tank/Vessel: Tag ID, Type, Model/Service, Design Capacity, Design Pressure, Operating Limit, Current Level, Status
4. Seluruh halaman diperbarui ke tampilan dark control-room yang lebih konsisten, responsif, dan rapi.
5. Data yang diedit disimpan menggunakan `localStorage` browser.

## Cara penggunaan
- Buka `index.html`.
- Isi/ubah parameter pada panel **Data Integrasi / Input Parameter**, lalu klik **Apply Data**.
- Klik **Power On System** untuk mengaktifkan visual flow dan KPI.
- Buka **Equipment Database** dari panel kanan atau klik station pada PFD.
- Di halaman equipment, gunakan Add / Edit / Del untuk mengelola master spesifikasi.

## Catatan integrasi backend
Versi ini masih frontend-only. Struktur sudah dipisahkan sehingga nanti lebih mudah mengganti `localStorage` dengan API / database aktual, misalnya:
- `/api/integration-data` untuk live operating parameter
- `/api/equipment/{station}` untuk master spesifikasi equipment

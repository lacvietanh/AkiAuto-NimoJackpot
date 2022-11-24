function $(id) {
  return document.getElementById(id);
}
function $qs(s) {
  return document.querySelector(s);
}
function $qsa(a) {
  return document.querySelectorAll(a);
}

let data = [
  { UserName: "vua cỏ", Bean: "37000", status: "Running" },
  { UserName: "ongvua", Bean: "270k", status: "Running" },
  { UserName: "nguyen", Bean: "523k", status: "Waiting" },
  { UserName: "hoa", Bean: "523k", status: "Waiting" },
  { UserName: "binh", Bean: "523k", status: "Waiting" },
  { UserName: "nimo2020145", Bean: "523k", status: "Waiting" },
  { UserName: "tranhung", Bean: "523k", status: "Waiting" },
  { UserName: "NguyenHang", Bean: "10000", status: "Running" },
  { UserName: "QuocViet", Bean: "0", status: "Idle" },
  { UserName: "BaoPhuong", Bean: "1.3M", status: "Running" },
  { UserName: "LacAnh", Bean: "50k", status: "Running" },
]
function addRow(x) {
  document.querySelector('#AccountTable tbody').innerHTML += /*html*/`
      <tr>
      <td class="counter child"></td>
      <td class="accSelector" onclick="selectAcc(this)">${x.UserName}</td>
      <td>${x.Bean}</td>
      <td>${x.status}</td>
      </tr>
    `;
}
data.forEach((row) => { addRow(row) });

function selectAcc(td) {
  if (!td.classList.contains('selected')) {
    let x = $qs('td.accSelector.selected');
    x ? x.classList.remove('selected') : null;
    td.classList.add('selected');
    panel.update(td);
  } else {
    console.log(`${td.innerHTML} already selected`);
  }
}
panel = class {
  static update(td) {
    $('panel-UserName').innerHTML = td.innerHTML;
  }
}
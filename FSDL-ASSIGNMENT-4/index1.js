/* =====================================================
   index1.js — Amazon Analytics Dashboard JavaScript
   Everything updated for Amazon styling and features.
   Amazon Orange → #FF9900
   Amazon Blue   → #146eb4
   ===================================================== */

/* ── India-specific Labels ────────────────────────── */
// Indian financial year: April to March
const MONTHS = ['Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec','Jan','Feb','Mar'];

const QUARTERS = ['Apr–Jun (Q1)', 'Jul–Sep (Q2)', 'Oct–Dec (Q3)', 'Jan–Mar (Q4)'];

// Top Indian states where Amazon sells the most
const STATES = ['Maharashtra', 'Tamil Nadu', 'Karnataka', 'Delhi', 'Gujarat', 'Telangana'];

// How customers find Amazon
const TRAFFIC_SOURCES = ['Google Search', 'Paid Ads', 'WhatsApp / Social', 'Word of Mouth'];

/* ── Amazon Color Palette ───────────────────────── */
const COLOR = {
  blue:      '#146eb4',   // Amazon blue accent
  orange:    '#FF9900',   // Amazon primary orange
  lightBlue: '#7ca8ff',   // lighter blue
  green:     '#26a541',   // success green
  red:       '#ff4d4d',   // alert red
  skyBlue:   '#38c4ff',   // chart accent
  purple:    '#a78bfa',   // extra accent
  teal:      '#14b8a6',   // teal accent
};

/* ── Helper Functions ─────────────────────────────── */

// Random decimal between min and max
function rand(min, max) {
  return Math.random() * (max - min) + min;
}

// Random whole number
function randInt(min, max) {
  return Math.round(rand(min, max));
}

// Convert hex color to rgba with given opacity
function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

/* ── Chart.js Global Defaults ─────────────────────── */
Chart.defaults.color = '#7a92c4';
Chart.defaults.font.family = "'Noto Sans', sans-serif";
Chart.defaults.font.size = 11;

// Shared tooltip style — dark amazon navy background
const TOOLTIP_STYLE = {
  backgroundColor: '#0a1a3d',
  borderColor: 'rgba(20,110,180,0.35)',
  borderWidth: 1,
  titleColor: '#e8eeff',
  bodyColor: '#7a92c4',
  padding: 10,
  cornerRadius: 8,
  displayColors: true,
  boxWidth: 8,
  boxHeight: 8,
  boxPadding: 4,
};

const GRID_COLOR = 'rgba(20,110,180,0.08)';
const TICK_COLOR = '#2a4080';

/* ── Chart Registry ───────────────────────────────── */
const CHARTS = {};

/* ── Data Generators ──────────────────────────────── */

// Monthly sales in ₹ Crore
function genMonthlySales() {
  let val = 18;
  return MONTHS.map(() => {
    val += rand(-1.5, 3.5);
    return parseFloat(val.toFixed(2));
  });
}

// Monthly target — smooth growth
function genMonthlyTarget() {
  return MONTHS.map((_, i) => parseFloat((18 + i * 0.7 + rand(-0.3, 0.5)).toFixed(2)));
}

// State-wise sales
function genStateSales() {
  return STATES.map(() => randInt(5000, 22000));
}

// Quarterly revenue and spend
function genQuarterRevenue() {
  return QUARTERS.map(() => randInt(60, 180));
}
function genQuarterSpend() {
  return QUARTERS.map(() => randInt(15, 60));
}

// Radar health scores (0–100)
function genRadarScores() {
  return [rand(52, 97), rand(52, 97), rand(52, 97), rand(52, 97), rand(52, 97), rand(52, 97)]
    .map(v => parseFloat(v.toFixed(1)));
}

// Traffic source visitor counts
function genTrafficData() {
  return TRAFFIC_SOURCES.map(() => randInt(800, 5000));
}

// Monthly new user sign-ups
function genNewUsers() {
  let count = 3200;
  return MONTHS.map(() => {
    count += randInt(100, 900);
    return count;
  });
}

// Scatter: cost to get customer (X) vs total value (Y)
function genScatterData(n = 30) {
  return Array.from({ length: n }, () => ({
    x: parseFloat(rand(500, 8000).toFixed(0)),
    y: parseFloat(rand(3000, 50000).toFixed(0)),
  }));
}

/* ── Metric Card Updates ──────────────────────────── */
function updateMetrics() {
  const revenue = randInt(120, 280);
  document.getElementById('m-revenue').textContent = `₹${revenue} Cr`;
  document.getElementById('m-revenue-d').textContent = `+${rand(3, 18).toFixed(1)}%`;

  const growth = rand(14, 42).toFixed(1);
  document.getElementById('m-growth').textContent = `${growth}%`;
  document.getElementById('m-growth-d').textContent = `↑ ${rand(1, 8).toFixed(1)} pp`;

  const users = rand(2.4, 8.9).toFixed(1);
  document.getElementById('m-users').textContent = `${users} L`;
  document.getElementById('m-users-d').textContent = `+${randInt(200, 1500)} / day`;

  const churn = rand(1.1, 5.5).toFixed(2);
  document.getElementById('m-churn').textContent = `${churn}%`;
  const dir = Math.random() > 0.5 ? '↑' : '↓';
  document.getElementById('m-churn-d').textContent = `${dir} ${rand(0.1, 0.9).toFixed(2)} pp`;
}

/* ── Chart Initializers ───────────────────────────── */

// 1. Monthly Sales vs Target — Line Chart
function initLineChart() {
  const ctx = document.getElementById('lineChart').getContext('2d');

  // Blue gradient fill under sales line — Amazon blue
  const gradient = ctx.createLinearGradient(0, 0, 0, 210);
  gradient.addColorStop(0, hexToRgba(COLOR.blue, 0.35));
  gradient.addColorStop(1, hexToRgba(COLOR.blue, 0));

  CHARTS.line = new Chart(ctx, {
    type: 'line',
    data: {
      labels: MONTHS,
      datasets: [
        {
          label: 'Actual Sales (₹ Cr)',
          data: genMonthlySales(),
          borderColor: COLOR.blue,
          backgroundColor: gradient,
          fill: true,
          tension: 0.45,
          borderWidth: 2.5,
          pointBackgroundColor: COLOR.blue,
          pointBorderColor: '#0d1e45',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 7,
        },
        {
          label: 'Target (₹ Cr)',
          data: genMonthlyTarget(),
          borderColor: COLOR.orange,
          backgroundColor: 'transparent',
          borderDash: [6, 4],
          fill: false,
          tension: 0.3,
          borderWidth: 2,
          pointRadius: 0,
          pointHoverRadius: 5,
          pointBackgroundColor: COLOR.orange,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { display: false },
        tooltip: {
          ...TOOLTIP_STYLE,
          callbacks: {
            label: ctx => ` ${ctx.dataset.label}: ₹${ctx.raw} Cr`,
          },
        },
      },
      scales: {
        x: { grid: { color: GRID_COLOR }, ticks: { color: TICK_COLOR } },
        y: {
          grid: { color: GRID_COLOR },
          ticks: { color: TICK_COLOR, callback: v => `₹${v}Cr` },
          beginAtZero: false,
        },
      },
    },
  });
}

// 2. Sales by State — Doughnut Chart
function initDoughnutChart() {
  const ctx = document.getElementById('doughnutChart').getContext('2d');

  // Center text: total sales
  const centerTextPlugin = {
    id: 'centerText',
    afterDraw(chart) {
      const { width, height, ctx: c } = chart;
      const total = chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
      c.save();
      c.textAlign = 'center';
      c.textBaseline = 'middle';

      const cx = width / 2;
      const cy = height * 0.52;

      c.fillStyle = '#7a92c4';
      c.font = "500 9px 'Noto Sans', sans-serif";
      c.fillText('TOTAL SALES', cx, cy - 16);

      c.fillStyle = '#e8eeff';
      c.font = "800 17px 'Baloo 2', cursive";
      c.fillText('₹' + (total / 1000).toFixed(0) + 'K Cr', cx, cy + 3);

      c.restore();
    },
  };

  CHARTS.doughnut = new Chart(ctx, {
    type: 'doughnut',
    plugins: [centerTextPlugin],
    data: {
      labels: STATES,
      datasets: [{
        data: genStateSales(),
        backgroundColor: [
          COLOR.blue, COLOR.orange, COLOR.skyBlue,
          COLOR.green, COLOR.purple, COLOR.teal,
        ],
        borderColor: '#0d1e45',
        borderWidth: 3,
        hoverOffset: 8,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '62%',
      plugins: {
        legend: {
          display: true,
          position: 'bottom',
          labels: {
            color: '#7a92c4',
            boxWidth: 10, boxHeight: 10,
            padding: 8,
            font: { size: 10 },
          },
        },
        tooltip: {
          ...TOOLTIP_STYLE,
          callbacks: {
            label: ctx => ` ${ctx.label}: ₹${ctx.raw.toLocaleString('en-IN')} Cr`,
          },
        },
      },
    },
  });
}

// 3. Quarterly Sales vs Spending — Grouped Bar Chart
function initBarChart() {
  const ctx = document.getElementById('barChart').getContext('2d');

  CHARTS.bar = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: QUARTERS,
      datasets: [
        {
          label: 'Revenue (₹ Cr)',
          data: genQuarterRevenue(),
          backgroundColor: hexToRgba(COLOR.blue, 0.8),
          borderColor: COLOR.blue,
          borderWidth: 1.5,
          borderRadius: 5,
          borderSkipped: false,
        },
        {
          label: 'Marketing Spend (₹ Cr)',
          data: genQuarterSpend(),
          backgroundColor: hexToRgba(COLOR.orange, 0.75),
          borderColor: COLOR.orange,
          borderWidth: 1.5,
          borderRadius: 5,
          borderSkipped: false,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: {
          display: true,
          position: 'top',
          align: 'end',
          labels: {
            color: '#7a92c4',
            boxWidth: 10, boxHeight: 10,
            padding: 10,
            font: { size: 10 },
          },
        },
        tooltip: {
          ...TOOLTIP_STYLE,
          callbacks: {
            label: ctx => ` ${ctx.dataset.label}: ₹${ctx.raw} Cr`,
          },
        },
      },
      scales: {
        x: { grid: { display: false }, ticks: { color: TICK_COLOR } },
        y: {
          grid: { color: GRID_COLOR },
          ticks: { color: TICK_COLOR, callback: v => `₹${v}Cr` },
        },
      },
    },
  });
}

// 4. Business Health Check — Radar Chart
function initRadarChart() {
  const ctx = document.getElementById('radarChart').getContext('2d');

  const labels = ['Delivery Speed', 'Product Quality', 'Cost Savings', 'Customer Trust', 'After-Sales', 'Growth Rate'];

  CHARTS.radar = new Chart(ctx, {
    type: 'radar',
    data: {
      labels,
      datasets: [
        {
          label: 'Our Score',
          data: genRadarScores(),
          backgroundColor: hexToRgba(COLOR.blue, 0.15),
          borderColor: COLOR.blue,
          borderWidth: 2,
          pointBackgroundColor: COLOR.blue,
          pointBorderColor: '#0d1e45',
          pointBorderWidth: 2,
          pointRadius: 4,
        },
        {
          label: 'Industry Average',
          data: labels.map(() => 70),
          backgroundColor: 'transparent',
          borderColor: hexToRgba(COLOR.orange, 0.4),
          borderDash: [5, 4],
          borderWidth: 1.5,
          pointRadius: 0,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'bottom',
          labels: {
            color: '#7a92c4',
            boxWidth: 10, boxHeight: 10,
            padding: 8,
            font: { size: 10 },
          },
        },
        tooltip: { ...TOOLTIP_STYLE },
      },
      scales: {
        r: {
          min: 0, max: 100,
          ticks: { display: false, stepSize: 25 },
          grid: { color: GRID_COLOR },
          angleLines: { color: GRID_COLOR },
          pointLabels: { color: '#7a92c4', font: { size: 10 } },
        },
      },
    },
  });
}

// 5. Where Visitors Come From — Horizontal Bar Chart
function initHorizontalBarChart() {
  const ctx = document.getElementById('hbarChart').getContext('2d');

  // Use Amazon blue/orange shades for the bars
  const barColors = [COLOR.blue, COLOR.orange, COLOR.skyBlue, COLOR.green];

  CHARTS.hbar = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: TRAFFIC_SOURCES,
      datasets: [{
        label: 'Visitors',
        data: genTrafficData(),
        backgroundColor: barColors.map(c => hexToRgba(c, 0.75)),
        borderColor: barColors,
        borderWidth: 1.5,
        borderRadius: 6,
        borderSkipped: false,
      }],
    },
    options: {
      indexAxis: 'y',          // makes bars go horizontal
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          ...TOOLTIP_STYLE,
          callbacks: {
            label: ctx => ` ${ctx.raw.toLocaleString('en-IN')} visitors`,
          },
        },
      },
      scales: {
        x: {
          grid: { color: GRID_COLOR },
          ticks: { color: TICK_COLOR, callback: v => v.toLocaleString('en-IN') },
        },
        y: {
          grid: { display: false },
          ticks: { color: '#7a92c4', font: { size: 10 } },
        },
      },
    },
  });
}

// 6. New Users Each Month — Area Chart
function initAreaChart() {
  const ctx = document.getElementById('areaChart').getContext('2d');

  // Blue-to-orange gradient fill — pure Amazon
  const gradient = ctx.createLinearGradient(0, 0, 0, 200);
  gradient.addColorStop(0,   hexToRgba(COLOR.blue, 0.7));
  gradient.addColorStop(0.6, hexToRgba(COLOR.lightBlue, 0.3));
  gradient.addColorStop(1,   hexToRgba(COLOR.blue, 0));

  CHARTS.area = new Chart(ctx, {
    type: 'line',
    data: {
      labels: MONTHS,
      datasets: [{
        label: 'New Users',
        data: genNewUsers(),
        fill: true,
        backgroundColor: gradient,
        borderColor: COLOR.lightBlue,
        borderWidth: 2.5,
        tension: 0.5,
        pointRadius: 3,
        pointBackgroundColor: COLOR.lightBlue,
        pointBorderColor: '#0d1e45',
        pointBorderWidth: 2,
        pointHoverRadius: 6,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          ...TOOLTIP_STYLE,
          callbacks: {
            label: ctx => ` ${ctx.raw.toLocaleString('en-IN')} new users`,
          },
        },
      },
      scales: {
        x: { grid: { color: GRID_COLOR }, ticks: { color: TICK_COLOR } },
        y: {
          grid: { color: GRID_COLOR },
          ticks: { color: TICK_COLOR, callback: v => v.toLocaleString('en-IN') },
        },
      },
    },
  });
}

// 7. Customer Cost vs Value — Scatter Chart
function initScatterChart() {
  const ctx = document.getElementById('scatterChart').getContext('2d');

  CHARTS.scatter = new Chart(ctx, {
    type: 'scatter',
    data: {
      datasets: [{
        label: 'Customer',
        data: genScatterData(32),
        backgroundColor: hexToRgba(COLOR.orange, 0.55),
        borderColor: COLOR.orange,
        borderWidth: 1,
        pointRadius: 5,
        pointHoverRadius: 8,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          ...TOOLTIP_STYLE,
          callbacks: {
            label: ctx => `Cost to Acquire: ₹${ctx.raw.x.toLocaleString('en-IN')}  |  Value: ₹${ctx.raw.y.toLocaleString('en-IN')}`,
          },
        },
      },
      scales: {
        x: {
          grid: { color: GRID_COLOR },
          ticks: { color: TICK_COLOR, callback: v => `₹${(v/1000).toFixed(0)}K` },
          title: {
            display: true,
            text: 'Cost to Get Customer (₹)',
            color: '#2a4080',
            font: { size: 10 },
          },
        },
        y: {
          grid: { color: GRID_COLOR },
          ticks: { color: TICK_COLOR, callback: v => `₹${(v/1000).toFixed(0)}K` },
          title: {
            display: true,
            text: 'Total Value They Bring (₹)',
            color: '#2a4080',
            font: { size: 10 },
          },
        },
      },
    },
  });
}

/* ── Timestamp ────────────────────────────────────── */
function updateTimestamp() {
  const now = new Date();
  document.getElementById('lastUpdated').textContent =
    now.toLocaleTimeString('en-IN', { hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

/* ── Refresh All Charts ───────────────────────────── */
function refreshAll() {
  const btn  = document.getElementById('refreshBtn');
  const icon = document.getElementById('refreshIcon');

  btn.disabled = true;
  icon.classList.add('spinning');

  setTimeout(() => {
    updateMetrics();

    CHARTS.line.data.datasets[0].data = genMonthlySales();
    CHARTS.line.data.datasets[1].data = genMonthlyTarget();
    CHARTS.line.update('active');

    CHARTS.doughnut.data.datasets[0].data = genStateSales();
    CHARTS.doughnut.update('active');

    CHARTS.bar.data.datasets[0].data = genQuarterRevenue();
    CHARTS.bar.data.datasets[1].data = genQuarterSpend();
    CHARTS.bar.update('active');

    CHARTS.radar.data.datasets[0].data = genRadarScores();
    CHARTS.radar.update('active');

    CHARTS.hbar.data.datasets[0].data = genTrafficData();
    CHARTS.hbar.update('active');

    CHARTS.area.data.datasets[0].data = genNewUsers();
    CHARTS.area.update('active');

    CHARTS.scatter.data.datasets[0].data = genScatterData(32);
    CHARTS.scatter.update('active');

    updateTimestamp();
    updateSparkline();

    icon.classList.remove('spinning');
    btn.disabled = false;
  }, 400);
}

/* ── Extra Features ───────────────────────────────── */
// download each chart as an image file
function exportCharts() {
  Object.entries(CHARTS).forEach(([name, chart]) => {
    const a = document.createElement('a');
    a.href = chart.toBase64Image();
    a.download = name + '.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  });
}

// simple light/dark toggle using CSS variables
function toggleTheme() {
  document.body.classList.toggle('light-mode');
  // redraw charts in case colors rely on CSS variables
  Object.values(CHARTS).forEach(c => c.update());
}

// ==== D3 sparkline for realtime visitors estimate ====
function drawSparkline(data) {
  const svg = d3.select('#sparkline');
  svg.selectAll('*').remove();
  const width = +svg.attr('width');
  const height = +svg.attr('height');
  const x = d3.scaleLinear().domain([0, data.length - 1]).range([0, width]);
  const y = d3.scaleLinear().domain([d3.min(data), d3.max(data)]).range([height, 0]);
  const line = d3.line()
                .x((d, i) => x(i))
                .y(d => y(d))
                .curve(d3.curveBasis);
  svg.append('path')
     .datum(data)
     .attr('d', line)
     .attr('stroke', 'var(--am-orange)')
     .attr('fill', 'none')
     .attr('stroke-width', 1.5);
}

function updateSparkline() {
  // random visitor counts (simulated)
  drawSparkline(Array.from({length:20}, () => rand(300, 1200)));
}

/* ── Start When Page Loads ────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  updateMetrics();
  initLineChart();
  initDoughnutChart();
  initBarChart();
  initRadarChart();
  initHorizontalBarChart();
  initAreaChart();
  initScatterChart();
  updateTimestamp();
  updateSparkline();
});

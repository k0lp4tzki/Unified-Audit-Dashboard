<?php
include 'report_data.php'; // Holt $reportData + $monthLabel
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Audit Monthly Summary – <?= $monthLabel ?></title>
  <link rel="stylesheet" href="report.css">
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body>
<body class="bg-light">
  <div class="container py-4">
    <div class="text-center mb-4">
      <h1 class="text-primary">📄 Audit Monthly Summary</h1>
      <p class="text-muted">Time window: <?= $monthLabel ?> | Created on: <?= date('m-d-Y') ?></p>
    </div>
    
    <div class="alert alert-info text-center">
    📊 <strong><?= number_format($reportData['total_events'], 0, ',', '.') ?></strong> Audit Events in current month.
    Most active user: <code><?= htmlspecialchars($reportData['top_user']) ?></code>,
    most used action: <code><?= htmlspecialchars($reportData['top_action']) ?></code>.
</div>
    <canvas id="eventChart" height="100"></canvas>

    <script>
document.addEventListener('DOMContentLoaded', () => {
  fetch('sources.php')
    .then(response => response.json())
    .then(data => {
      const datalist = document.getElementById('dbList');
      data.forEach(db => {
        const option = document.createElement('option');
        option.value = db;
        datalist.appendChild(option);
      });
    });
});
</script>

    

<form method="get" class="mb-4">
  <div class="row g-3 align-items-center">
    <div class="col-auto">
      <label for="month" class="col-form-label">Month:</label>
    </div>
    <div class="col-auto">
      <input type="month" id="month" name="month" class="form-control" value="<?= $reportMonth ?>" required>
    </div>
    <div class="col-auto">
      <label for="source" class="col-form-label">Database (UPPERCASE):</label>
    </div>
    <div class="col-auto">
      <input list="dbList" id="source" name="source" class="form-control text-uppercase" 
             value="<?= htmlspecialchars($source ?? '') ?>" autocomplete="off">
      <datalist id="dbList"></datalist>
    </div>
    <div class="col-auto">
      <button type="submit" class="btn btn-outline-primary">🧾 Show Report</button>
    </div>
  </div>
</form>



<section class="mb-5">
  <h3 class="text-secondary">🔝 Top 10 Actions</h3>
  <ul class="list-group">
    <?php foreach ($reportData['top_actions'] as $row): ?>
      <li class="list-group-item d-flex justify-content-between align-items-center">
        <?= htmlspecialchars($row['ACTION_NAME']) ?>
        <span class="badge bg-primary rounded-pill"><?= $row['COUNT'] ?></span>
      </li>
    <?php endforeach; ?>
  </ul>
</section>

<section class="mb-5">
  <h3 class="text-secondary">🧑‍💻 Top 10 DB Usernames</h3>
  <ul class="list-group">
    <?php foreach ($reportData['top_db_users'] as $row): ?>
      <li class="list-group-item d-flex justify-content-between align-items-center">
        <?= htmlspecialchars($row['DBUSERNAME']) ?>
        <span class="badge bg-info text-dark rounded-pill"><?= $row['COUNT'] ?></span>
      </li>
    <?php endforeach; ?>
  </ul>
</section>

<section class="mb-5">
  <h3 class="text-secondary">🌐 Top 10 Hostnames</h3>
  <ul class="list-group">
    <?php foreach ($reportData['top_userhosts'] as $row): ?>
      <li class="list-group-item d-flex justify-content-between align-items-center">
        <?= htmlspecialchars($row['USERHOST']) ?>
        <span class="badge bg-warning text-dark rounded-pill"><?= $row['COUNT'] ?></span>
      </li>
    <?php endforeach; ?>
  </ul>
</section>

<section class="mb-5">
  <h3 class="text-secondary">📡 Top 10 Source Databases</h3>
  <ul class="list-group">
    <?php foreach ($reportData['top_sources'] as $row): ?>
      <li class="list-group-item d-flex justify-content-between align-items-center">
        <?= htmlspecialchars($row['SOURCE_DATABASE']) ?>
        <span class="badge bg-success rounded-pill"><?= $row['COUNT'] ?></span>
      </li>
    <?php endforeach; ?>
  </ul>
</section>

<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<script>
  const chartLabels = <?= json_encode(array_column($reportData['daily'], 'EVENT_DATE')) ?>;
  const chartData = <?= json_encode(array_column($reportData['daily'], 'EVENT_COUNT')) ?>;

  const ctx = document.getElementById('eventChart').getContext('2d');
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: chartLabels,
      datasets: [{
        label: 'Events per day',
        data: chartData,
        fill: true,
        borderColor: '#36A2EB',
        backgroundColor: 'rgba(54,162,235,0.1)',
        tension: 0.3,
        pointRadius: 3
      }]
    },
    options: {
      scales: {
        x: { title: { display: true, text: 'Datum' } },
        y: { title: { display: true, text: 'Anzahl Events' } }
      }
    }
  });
</script>


<!-- Diagnose Footer -->
<div class="container mt-4 mb-5">
  <div class="card border-info">
    <div class="card-header bg-info text-white">
      System Diagnostics
    </div>
    <div class="card-body">
      <ul class="mb-0">
        <li>🔧 Last Index Rebuild: <code><?= $diagnostics['last_index_rebuild'] ?? 'N/A' ?></code></li>
        <li>📊 Last statistic run: <code><?= $diagnostics['last_stats_update'] ?? 'N/A' ?></code></li>
        <li>📈 Most used object: <code><?= $diagnostics['top_column'] ?? 'N/A' ?></code></li>
        <li>📦 Table name: <code><?= $diagnostics['table_name'] ?? 'DASHBOARD' ?></code></li>
        <li>🕒 Report runtime: <code><?= $diagnostics['runtime'] ?? 'N/A' ?> Sek.</code></li>
        <li>📅 Rerport generated: <code><?= date('d.m.Y H:i:s') ?></code></li>
      </ul>
    </div>
    
  </div>
  <div class="text-center my-4">
    <a href="../index.php" class="btn btn-outline-secondary btn-lg">
        ⬅️ Back to Dashboard
    </a>
</div>
</body>
</html>
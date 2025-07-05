import React, { useState } from 'react';
import { useExpense } from '../context/ExpenseContext';
import { useNotification } from '../context/NotificationContext';
import { 
  Upload, 
  Download, 
  FileText, 
  AlertCircle, 
  CheckCircle,
  Clock,
  HardDrive
} from 'lucide-react';
import { uploadCSV, downloadCSV } from '../services/csvService';

/**
 * CSV Import/Export Component
 * Handles CSV file operations with user-friendly interface
 */
const CSVManager = () => {
  const { expenses, categories, importData, getBackupInfo } = useExpense();
  const { success, error, info } = useNotification();
  const [isImporting, setIsImporting] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  
  const backupInfo = getBackupInfo();

  const handleFileUpload = async (file) => {
    setIsImporting(true);
    
    try {
      const parsedData = await uploadCSV(file);
      
      if (parsedData.expenses.length === 0) {
        error('No Data Found', 'The CSV file does not contain any expense data.');
        return;
      }
      
      // Import the data
      importData(parsedData);
      
      success(
        'Data Imported Successfully! 🎉',
        `Imported ${parsedData.expenses.length} expenses and ${parsedData.categories.length} categories.`
      );
      
    } catch (err) {
      error('Import Failed', err.message);
    } finally {
      setIsImporting(false);
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragOver(false);
    
    const file = event.dataTransfer.files[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleExport = () => {
    if (expenses.length === 0) {
      info('No Data to Export', 'Add some expenses first to export data.');
      return;
    }

    try {
      downloadCSV(expenses, categories);
      success(
        'CSV Export Successful! 📄',
        `Exported ${expenses.length} expenses to CSV file.`
      );
    } catch (err) {
      error('Export Failed', 'Failed to export CSV file. Please try again.');
    }
  };

  const handleDownloadSample = () => {
    const sampleCSV = `# EXPENSE TRACKER PRO DATA
# Generated on: ${new Date().toISOString()}
# Categories: 🍔 Food & Dining;🚗 Transportation;🛒 Shopping;🏠 Bills & Utilities;🎬 Entertainment
# Total Expenses: 3
# Total Amount: 950.00

# EXPENSE DATA
ID,Description,Amount,Category,Date,Timestamp,Notes
${Date.now()}1,"Coffee and breakfast",250,"🍔 Food & Dining","${new Date().toISOString().split('T')[0]}","${new Date().toISOString()}","Sample expense 1"
${Date.now()}2,"Bus fare",50,"🚗 Transportation","${new Date().toISOString().split('T')[0]}","${new Date().toISOString()}","Sample expense 2"
${Date.now()}3,"Lunch",650,"🍔 Food & Dining","${new Date().toISOString().split('T')[0]}","${new Date().toISOString()}","Sample expense 3"`;

    const blob = new Blob([sampleCSV], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'sample_expenses.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    info('Sample Downloaded', 'Use this sample CSV file to understand the expected format for imports.');
  };

  return (
    <div className="csv-manager">
      <div className="csv-section">
        <h3 className="section-title">
          <HardDrive size={20} />
          Data Storage & Backup
        </h3>
        
        {/* Backup Status */}
        <div className="backup-status glass-card">
          <div className="backup-info">
            <div className="backup-icon">
              {backupInfo ? (
                <CheckCircle size={24} className="text-success" />
              ) : (
                <AlertCircle size={24} className="text-warning" />
              )}
            </div>
            <div className="backup-details">
              <h4>Auto-Backup Status</h4>
              {backupInfo ? (
                <div className="backup-meta">
                  <p className="backup-timestamp">
                    <Clock size={16} />
                    Last backup: {new Date(backupInfo.timestamp).toLocaleString()}
                  </p>
                  <p className="backup-count">
                    {backupInfo.expenseCount} expenses backed up
                  </p>
                </div>
              ) : (
                <p className="text-muted">No backup data found</p>
              )}
            </div>
          </div>
          <div className="backup-description">
            <p>
              Your expense data is automatically backed up in CSV format every time you make changes.
              This ensures your data is safe even if browser storage is cleared.
            </p>
          </div>
        </div>
      </div>

      {/* Export Section */}
      <div className="csv-section">
        <h3 className="section-title">
          <Download size={20} />
          Export Data
        </h3>
        
        <div className="export-container glass-card">
          <div className="export-info">
            <FileText size={32} className="export-icon" />
            <div className="export-details">
              <h4>Download CSV File</h4>
              <p>Export all your expenses and categories to a CSV file for backup or use in other applications.</p>
              <div className="export-stats">
                <span className="stat-item">
                  <strong>{expenses.length}</strong> expenses
                </span>
                <span className="stat-item">
                  <strong>{categories.length}</strong> categories
                </span>
              </div>
            </div>
          </div>
          
          <button
            onClick={handleExport}
            className="btn btn-primary export-btn"
            disabled={expenses.length === 0}
          >
            <Download size={18} />
            Export CSV
          </button>
        </div>
      </div>

      {/* Import Section */}
      <div className="csv-section">
        <h3 className="section-title">
          <Upload size={20} />
          Import Data
        </h3>
        
        <div className="import-container glass-card">
          <div
            className={`drop-zone ${isDragOver ? 'drag-over' : ''} ${isImporting ? 'importing' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="drop-zone-content">
              {isImporting ? (
                <div className="importing-state">
                  <div className="spinner"></div>
                  <p>Importing CSV data...</p>
                </div>
              ) : (
                <>
                  <Upload size={48} className="upload-icon" />
                  <h4>Drop CSV file here or click to browse</h4>
                  <p>Import expenses and categories from a CSV file</p>
                  <div className="file-requirements">
                    <p className="requirement">• CSV format only</p>
                    <p className="requirement">• Maximum file size: 10MB</p>
                    <p className="requirement">• Will merge with existing data</p>
                    <button 
                      onClick={handleDownloadSample}
                      className="btn btn-outline sample-btn"
                    >
                      Download Sample CSV
                    </button>
                  </div>
                </>
              )}
            </div>
            
            <input
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              disabled={isImporting}
              className="file-input"
            />
          </div>
        </div>
      </div>

      {/* Sample Download Section */}
      <div className="csv-section">
        <h3 className="section-title">
          <Download size={20} />
          Download Sample CSV
        </h3>
        
        <div className="sample-download-container glass-card">
          <p>
            Not sure about the CSV format? Download this sample CSV file to see the expected structure for your expense data.
          </p>
          
          <button
            onClick={handleDownloadSample}
            className="btn btn-secondary"
          >
            <Download size={18} />
            Download Sample CSV
          </button>
        </div>
      </div>

      <style jsx>{`
        .csv-manager {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .csv-section {
          margin-bottom: 2rem;
        }

        .section-title {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 1.2rem;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 1rem;
        }

        .backup-status {
          padding: 1.5rem;
        }

        .backup-info {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .backup-icon .text-success {
          color: var(--success-color);
        }

        .backup-icon .text-warning {
          color: var(--warning-color);
        }

        .backup-details h4 {
          margin: 0 0 0.5rem 0;
          color: var(--text-primary);
        }

        .backup-meta {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .backup-timestamp {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.9rem;
          color: var(--text-secondary);
        }

        .backup-count {
          font-size: 0.9rem;
          color: var(--text-secondary);
          margin: 0;
        }

        .backup-description {
          padding: 1rem;
          background: var(--glass-bg);
          border-radius: 8px;
          border: 1px solid var(--glass-border);
        }

        .backup-description p {
          margin: 0;
          color: var(--text-secondary);
          font-size: 0.9rem;
          line-height: 1.5;
        }

        .export-container {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.5rem;
          gap: 1rem;
        }

        .export-info {
          display: flex;
          align-items: center;
          gap: 1rem;
          flex: 1;
        }

        .export-icon {
          color: var(--info-color);
          flex-shrink: 0;
        }

        .export-details h4 {
          margin: 0 0 0.5rem 0;
          color: var(--text-primary);
        }

        .export-details p {
          margin: 0 0 0.5rem 0;
          color: var(--text-secondary);
          font-size: 0.9rem;
        }

        .export-stats {
          display: flex;
          gap: 1rem;
        }

        .stat-item {
          font-size: 0.85rem;
          color: var(--text-muted);
        }

        .export-btn {
          flex-shrink: 0;
        }

        .import-container {
          padding: 1.5rem;
        }

        .drop-zone {
          border: 2px dashed var(--glass-border);
          border-radius: 12px;
          padding: 2rem;
          text-align: center;
          position: relative;
          transition: all var(--transition-normal);
          cursor: pointer;
        }

        .drop-zone.drag-over {
          border-color: var(--success-color);
          background: var(--glass-bg-strong);
        }

        .drop-zone.importing {
          pointer-events: none;
          opacity: 0.7;
        }

        .drop-zone-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
        }

        .upload-icon {
          color: var(--text-muted);
          transition: color var(--transition-normal);
        }

        .drop-zone:hover .upload-icon {
          color: var(--success-color);
        }

        .drop-zone h4 {
          margin: 0;
          color: var(--text-primary);
        }

        .drop-zone p {
          margin: 0;
          color: var(--text-secondary);
        }

        .file-requirements {
          margin-top: 1rem;
          padding: 1rem;
          background: var(--glass-bg);
          border-radius: 8px;
          border: 1px solid var(--glass-border);
        }

        .requirement {
          margin: 0.25rem 0;
          font-size: 0.85rem;
          color: var(--text-muted);
        }

        .sample-btn {
          margin-top: 0.75rem;
          padding: 0.5rem 1rem;
          font-size: 0.8rem;
        }

        .file-input {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          opacity: 0;
          cursor: pointer;
        }

        .importing-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
        }

        .spinner {
          width: 32px;
          height: 32px;
          border: 3px solid var(--glass-border);
          border-top: 3px solid var(--success-color);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .export-container {
            flex-direction: column;
            align-items: stretch;
          }
          
          .export-info {
            margin-bottom: 1rem;
          }
        }

        .sample-download-container {
          padding: 1.5rem;
          text-align: center;
          background: var(--glass-bg);
          border-radius: 8px;
          border: 1px solid var(--glass-border);
        }

        .sample-download-container p {
          margin: 0 0 1rem 0;
          color: var(--text-secondary);
          font-size: 0.9rem;
        }
      `}</style>
    </div>
  );
};

export default CSVManager;

'use client'

import { useState } from 'react'
import { Download, FileSpreadsheet, FileText, X, Loader } from 'lucide-react'

interface ExportButtonProps {
  type: 'members' | 'leaderboard' | 'winners' | 'achievements'
  year?: number
  status?: string
  label?: string
}

export default function ExportButton({ type, year, status, label = 'Export' }: ExportButtonProps) {
  const [showOptions, setShowOptions] = useState(false)
  const [loading, setLoading] = useState(false)

  const exportData = async (format: 'csv' | 'pdf') => {
    setLoading(true)
    try {
      let url = `/api/export?type=${type}&format=${format === 'csv' ? 'csv' : 'json'}`
      if (year) url += `&year=${year}`
      if (status) url += `&status=${status}`

      const response = await fetch(url)
      
      if (format === 'csv') {
        const blob = await response.blob()
        const downloadUrl = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = downloadUrl
        a.download = `ieee-sight-${type}${year ? `-${year}` : ''}.csv`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(downloadUrl)
      } else {
        // For PDF, we'll generate it client-side using the JSON data
        const result = await response.json()
        if (result.success) {
          generatePDF(result.data, result.headers, result.filename)
        }
      }
    } catch (error) {
      console.error('Export error:', error)
      alert('Failed to export data')
    } finally {
      setLoading(false)
      setShowOptions(false)
    }
  }

  const generatePDF = (data: any[], headers: string[], filename: string) => {
    // Create a printable HTML table
    const tableHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>IEEE SIGHT AITR - ${filename}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 20px;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .header h1 {
              color: #00629B;
              margin: 0;
            }
            .header p {
              color: #666;
              margin-top: 5px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 10px;
              text-align: left;
            }
            th {
              background-color: #00629B;
              color: white;
            }
            tr:nth-child(even) {
              background-color: #f9f9f9;
            }
            .footer {
              margin-top: 30px;
              text-align: center;
              color: #666;
              font-size: 12px;
            }
            @media print {
              body { margin: 0; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>IEEE SIGHT AITR</h1>
            <p>${filename.replace(/-/g, ' ').toUpperCase()}</p>
            <p>Generated on ${new Date().toLocaleDateString()}</p>
          </div>
          <table>
            <thead>
              <tr>
                ${headers.map(h => `<th>${h}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${data.map(row => `
                <tr>
                  ${Object.values(row).map(val => `<td>${val}</td>`).join('')}
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="footer">
            <p>© ${new Date().getFullYear()} IEEE SIGHT AITR - All Rights Reserved</p>
          </div>
        </body>
      </html>
    `

    // Open print dialog
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(tableHTML)
      printWindow.document.close()
      printWindow.focus()
      setTimeout(() => {
        printWindow.print()
      }, 500)
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowOptions(!showOptions)}
        className="flex items-center gap-2 px-4 py-2 bg-ieee-blue text-white rounded-lg hover:bg-ieee-light transition"
        disabled={loading}
      >
        {loading ? (
          <Loader className="animate-spin" size={18} />
        ) : (
          <Download size={18} />
        )}
        {label}
      </button>

      {showOptions && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setShowOptions(false)}
          />
          <div className="absolute right-0 top-12 bg-white rounded-lg shadow-xl border border-gray-200 z-20 overflow-hidden min-w-[200px]">
            <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Export Format</span>
              <button onClick={() => setShowOptions(false)}>
                <X size={16} className="text-gray-400 hover:text-gray-600" />
              </button>
            </div>
            <button
              onClick={() => exportData('csv')}
              className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition"
            >
              <FileSpreadsheet className="text-green-600" size={20} />
              <div className="text-left">
                <p className="font-medium text-gray-800">Excel/CSV</p>
                <p className="text-xs text-gray-500">Spreadsheet format</p>
              </div>
            </button>
            <button
              onClick={() => exportData('pdf')}
              className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition border-t border-gray-100"
            >
              <FileText className="text-red-600" size={20} />
              <div className="text-left">
                <p className="font-medium text-gray-800">PDF</p>
                <p className="text-xs text-gray-500">Print-ready document</p>
              </div>
            </button>
          </div>
        </>
      )}
    </div>
  )
}

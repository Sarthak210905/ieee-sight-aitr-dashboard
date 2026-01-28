'use client'

import { useState, useRef, useEffect } from 'react'
import { Award, Download, User, Calendar, Trophy, Printer } from 'lucide-react'

interface CertificateData {
  recipientName: string
  achievementTitle: string
  date: string
  category: string
  points: number
  certificateId: string
}

interface CertificateGeneratorProps {
  data?: CertificateData
  onClose?: () => void
}

export default function CertificateGenerator({ data, onClose }: CertificateGeneratorProps) {
  const certificateRef = useRef<HTMLDivElement>(null)
  const [formData, setFormData] = useState<CertificateData>({
    recipientName: data?.recipientName || '',
    achievementTitle: data?.achievementTitle || '',
    date: data?.date || new Date().toISOString().split('T')[0],
    category: data?.category || 'excellence',
    points: data?.points || 0,
    certificateId: data?.certificateId || generateCertificateId(),
  })

  function generateCertificateId() {
    return `IEEE-SIGHT-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`
  }

  const handlePrint = () => {
    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    const certificateHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Certificate - ${formData.recipientName}</title>
          <style type="text/css">
            @page { size: landscape; margin: 0; }
            body, html {
              margin: 0;
              padding: 0;
            }
            body {
              color: black;
              display: table;
              font-family: Georgia, serif;
              font-size: 24px;
              text-align: center;
              width: 100%;
              height: 100vh;
            }
            .container {
              border: 20px solid #00629B;
              width: 750px;
              height: 563px;
              display: table-cell;
              vertical-align: middle;
              margin: auto;
            }
            .wrapper {
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
            }
            .logo {
              color: #00629B;
              font-size: 28px;
              font-weight: bold;
            }
            .logo-sub {
              color: #666;
              font-size: 14px;
              margin-top: 5px;
            }
            .marquee {
              color: #00629B;
              font-size: 42px;
              margin: 20px;
              font-weight: bold;
            }
            .assignment {
              margin: 20px;
              font-size: 18px;
              color: #666;
            }
            .person {
              border-bottom: 2px solid #00629B;
              font-size: 36px;
              font-style: italic;
              margin: 20px auto;
              width: 400px;
              padding-bottom: 10px;
              color: #00629B;
              font-weight: bold;
            }
            .reason {
              margin: 20px;
              font-size: 20px;
            }
            .date {
              margin: 15px;
              font-size: 16px;
              color: #666;
            }
            .signatures {
              display: flex;
              justify-content: space-around;
              margin-top: 40px;
              padding: 0 50px;
            }
            .signature {
              text-align: center;
            }
            .signature-line {
              width: 150px;
              border-top: 1px solid #333;
              margin-bottom: 5px;
            }
            .signature-text {
              font-size: 12px;
              color: #666;
            }
            .cert-id {
              font-size: 10px;
              color: #999;
              margin-top: 20px;
            }
          </style>
        </head>
        <body>
          <div class="wrapper">
            <div class="container">
              <div class="logo">IEEE SIGHT AITR</div>
              <div class="logo-sub">Special Interest Group on Humanitarian Technology</div>
              
              <div class="marquee">Certificate of ${formData.category === 'event' ? 'Participation' : 'Achievement'}</div>
              
              <div class="assignment">This certificate is presented to</div>
              
              <div class="person">${formData.recipientName || 'Recipient Name'}</div>
              
              <div class="reason">
                For successfully completing<br/>
                <strong>${formData.achievementTitle || 'Achievement Title'}</strong>
              </div>
              
              <div class="date">
                Awarded on ${new Date(formData.date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
              
              <div class="signatures">
                <div class="signature">
                  <div class="signature-line"></div>
                  <div class="signature-text">Faculty Advisor</div>
                </div>
                <div class="signature">
                  <div class="signature-line"></div>
                  <div class="signature-text">Chairperson</div>
                </div>
              </div>
              
              <div class="cert-id">${formData.certificateId}</div>
            </div>
          </div>
        </body>
      </html>
    `

    printWindow.document.write(certificateHTML)
    printWindow.document.close()
    
    setTimeout(() => {
      printWindow.print()
    }, 500)
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'event': return '#3b82f6'
      case 'contribution': return '#22c55e'
      case 'leadership': return '#a855f7'
      case 'excellence': return '#eab308'
      default: return '#00629B'
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Award className="text-ieee-blue" />
            Certificate Generator
          </h2>
          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-ieee-blue text-white rounded-lg hover:bg-ieee-light transition"
            >
              <Printer size={18} />
              Print / Save PDF
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                Close
              </button>
            )}
          </div>
        </div>

        {/* Form & Preview */}
        <div className="p-6 grid lg:grid-cols-2 gap-6">
          {/* Form */}
          <div className="space-y-4">
            <h3 className="font-bold text-gray-800">Certificate Details</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Recipient Name *
              </label>
              <input
                type="text"
                value={formData.recipientName}
                onChange={(e) => setFormData({ ...formData, recipientName: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ieee-blue"
                placeholder="Full name of recipient"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Achievement/Event Title *
              </label>
              <input
                type="text"
                value={formData.achievementTitle}
                onChange={(e) => setFormData({ ...formData, achievementTitle: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ieee-blue"
                placeholder="e.g., Workshop on AI/ML"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ieee-blue"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ieee-blue"
                >
                  <option value="event">Event Participation</option>
                  <option value="contribution">Contribution</option>
                  <option value="leadership">Leadership</option>
                  <option value="excellence">Excellence</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Certificate ID
              </label>
              <input
                type="text"
                value={formData.certificateId}
                readOnly
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
              />
            </div>
          </div>

          {/* Preview */}
          <div className="overflow-hidden rounded-lg border-2 border-gray-200">
            <div className="text-xs text-center text-gray-500 py-1 bg-gray-100">Preview</div>
            <div 
              ref={certificateRef}
              className="aspect-[4/3] bg-white flex items-center justify-center p-4"
            >
              {/* Certificate Container */}
              <div 
                className="w-full h-full flex flex-col items-center justify-center text-center"
                style={{ 
                  border: '12px solid #00629B',
                  fontFamily: 'Georgia, serif',
                  padding: '20px'
                }}
              >
                {/* Logo */}
                <div className="text-ieee-blue font-bold text-lg">IEEE SIGHT AITR</div>
                <div className="text-gray-500 text-xs mb-3">Special Interest Group on Humanitarian Technology</div>

                {/* Marquee */}
                <h2 className="text-ieee-blue text-2xl font-bold my-3">
                  Certificate of {formData.category === 'event' ? 'Participation' : 'Achievement'}
                </h2>

                {/* Assignment */}
                <p className="text-gray-600 text-sm my-2">This certificate is presented to</p>

                {/* Person Name */}
                <div 
                  className="text-xl font-bold italic my-2 pb-2 px-8"
                  style={{ 
                    borderBottom: '2px solid #00629B',
                    color: '#00629B'
                  }}
                >
                  {formData.recipientName || 'Recipient Name'}
                </div>

                {/* Reason */}
                <div className="my-3 text-sm">
                  <p>For successfully completing</p>
                  <p className="font-bold mt-1">{formData.achievementTitle || 'Achievement Title'}</p>
                </div>

                {/* Date */}
                <p className="text-xs text-gray-500 my-2">
                  Awarded on {new Date(formData.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>

                {/* Signatures */}
                <div className="flex justify-around w-full mt-4 px-8">
                  <div className="text-center">
                    <div className="w-20 border-t border-gray-400 mx-auto mb-1"></div>
                    <p className="text-xs text-gray-600">Faculty Advisor</p>
                  </div>
                  <div className="text-center">
                    <div className="w-20 border-t border-gray-400 mx-auto mb-1"></div>
                    <p className="text-xs text-gray-600">Chairperson</p>
                  </div>
                </div>

                {/* Certificate ID */}
                <p className="text-xs text-gray-400 mt-3">{formData.certificateId}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

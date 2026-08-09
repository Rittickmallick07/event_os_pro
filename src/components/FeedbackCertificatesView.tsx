import React, { useState } from 'react';
import { Award, Star, MessageSquare, Download, CheckCircle2, Sparkles, Shield } from 'lucide-react';
import { Feedback, Certificate } from '../types';

interface FeedbackCertificatesViewProps {
  feedbackList: Feedback[];
  certificatesList: Certificate[];
  onAddFeedback: (fb: Partial<Feedback>) => void;
  onGenerateCertificate: (userName: string) => void;
}

export const FeedbackCertificatesView: React.FC<FeedbackCertificatesViewProps> = ({
  feedbackList,
  certificatesList,
  onAddFeedback,
  onGenerateCertificate,
}) => {
  const [userName, setUserName] = useState('');
  const [rating, setRating] = useState(5);
  const [category, setCategory] = useState<'Keynote' | 'Venue' | 'Organization' | 'Food' | 'Overall'>('Keynote');
  const [comments, setComments] = useState('');

  // Certificate generation state
  const [certAttendeeName, setCertAttendeeName] = useState('');
  const [selectedCertModal, setSelectedCertModal] = useState<Certificate | null>(null);

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comments.trim()) return;

    onAddFeedback({
      userName: userName.trim() || 'Event Attendee',
      rating,
      category,
      comments: comments.trim(),
    });

    setComments('');
  };

  const handleCertGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!certAttendeeName.trim()) return;

    onGenerateCertificate(certAttendeeName.trim());
    setCertAttendeeName('');
  };

  return (
    <div className="p-4 md:p-8 max-w-[1440px] mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Award className="w-6 h-6 text-blue-600" /> Post-Event Feedback & Automated Certificates
        </h2>
        <p className="text-sm text-gray-500 mt-0.5">
          Collect attendee ratings and automatically issue verified certificates of attendance.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Post-Event Feedback */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <h3 className="font-bold text-base text-gray-900 mb-1 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-blue-600" /> Submit Event Feedback
            </h3>
            <p className="text-xs text-gray-500 mb-5">Rate your overall event experience.</p>

            <form onSubmit={handleFeedbackSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Your Name</label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="e.g. Elena Rodriguez"
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Rating Score
                  </label>
                  <div className="flex items-center gap-1 text-amber-400">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="cursor-pointer"
                      >
                        <Star
                          className={`w-6 h-6 ${
                            star <= rating
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-gray-300 fill-none'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-900 focus:outline-none"
                  >
                    <option value="Keynote">Keynote Session</option>
                    <option value="Organization">Organization & Check-in</option>
                    <option value="Venue">Venue & Stage</option>
                    <option value="Food">Food & Catering</option>
                    <option value="Overall">Overall Conference</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Comments & Testimonial
                </label>
                <textarea
                  rows={3}
                  required
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder="Share feedback on speaker sessions, check-in kiosks, or organization..."
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-900 focus:outline-none focus:border-blue-600"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-lg shadow-sm transition-all cursor-pointer"
              >
                Submit Feedback
              </button>
            </form>
          </div>

          {/* Feedback Stream */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-3">
            <h4 className="font-bold text-sm text-gray-900">Recent Feedback Reviews</h4>
            {feedbackList.map((fb) => (
              <div key={fb.id} className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs text-gray-900">{fb.userName}</span>
                  <div className="flex text-amber-400">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-3.5 h-3.5 ${
                          s <= fb.rating ? 'fill-amber-400' : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-gray-600">{fb.comments}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Automated Certificate Generator */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <h3 className="font-bold text-base text-gray-900 mb-1 flex items-center gap-2">
              <Award className="w-5 h-5 text-blue-600" /> Automated Certificate Generator
            </h3>
            <p className="text-xs text-gray-500 mb-5">
              Certificates are automatically generated upon QR code check-in or issued manually below.
            </p>

            <form onSubmit={handleCertGenerate} className="flex gap-3">
              <input
                type="text"
                required
                value={certAttendeeName}
                onChange={(e) => setCertAttendeeName(e.target.value)}
                placeholder="Attendee Full Name"
                className="flex-1 px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-900 focus:outline-none"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold shadow-sm transition-colors cursor-pointer shrink-0"
              >
                Generate Cert
              </button>
            </form>
          </div>

          {/* Certificates Issued List */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-3">
            <h4 className="font-bold text-sm text-gray-900 flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-600" /> Verified Issued Certificates
            </h4>

            {certificatesList.map((cert) => (
              <div
                key={cert.id}
                className="p-4 bg-blue-50/40 rounded-lg border border-blue-100 flex items-center justify-between"
              >
                <div>
                  <div className="font-bold text-sm text-gray-900">{cert.userName}</div>
                  <div className="text-xs text-blue-800 font-mono font-medium">
                    {cert.certificateNumber}
                  </div>
                  <div className="text-[10px] text-gray-500">
                    Issued: {new Date(cert.issuedAt).toLocaleDateString()}
                  </div>
                </div>

                <button
                  onClick={() => setSelectedCertModal(cert)}
                  className="px-3 py-1.5 bg-blue-600 text-white hover:bg-blue-500 rounded-lg text-xs font-bold cursor-pointer shadow-sm flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" /> View Badge
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Certificate Modal */}
      {selectedCertModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-8 border-4 border-purple-600 shadow-2xl relative text-center space-y-6">
            <button
              onClick={() => setSelectedCertModal(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-sm font-bold"
            >
              ✕
            </button>

            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 shadow-md">
                <Award className="w-10 h-10" />
              </div>
            </div>

            <div>
              <h3 className="text-xs font-bold text-purple-700 uppercase tracking-widest mb-1">
                Certificate of Attendance & Participation
              </h3>
              <h2 className="text-2xl font-black text-slate-900">TechSummit 2026 Global</h2>
            </div>

            <div className="py-4 border-y border-gray-200 space-y-2">
              <p className="text-xs text-gray-500">This is to officially certify that</p>
              <p className="text-2xl font-serif font-bold text-[#0058be] italic">
                {selectedCertModal.userName}
              </p>
              <p className="text-xs text-gray-600 max-w-md mx-auto">
                has successfully checked in and participated in all keynotes, engineering tracks, and sessions.
              </p>
            </div>

            <div className="flex items-center justify-between text-xs text-gray-500 font-mono pt-2">
              <div>
                <span className="block text-[10px] text-gray-400">CERTIFICATE NO</span>
                <span className="font-bold text-slate-800">{selectedCertModal.certificateNumber}</span>
              </div>
              <div>
                <span className="block text-[10px] text-gray-400">VERIFICATION SEAL</span>
                <span className="font-bold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Signed & Verified
                </span>
              </div>
            </div>

            <button
              onClick={() => window.print()}
              className="w-full py-3 bg-purple-600 text-white font-bold text-xs rounded-xl hover:bg-purple-700 transition-colors cursor-pointer"
            >
              Print / Save Certificate PDF
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

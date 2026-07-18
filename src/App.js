import React, { useState } from 'react';
import jsPDF from 'jspdf';

const RevenueLeakScorecard = () => {
  const [step, setStep] = useState('start'); // start, questions, results
  const [responses, setResponses] = useState({});
  const [contact, setContact] = useState({ name: '', whatsapp: '' });
  const [currentQ, setCurrentQ] = useState(0);

  const questions = [
    {
      id: 'website_clarity',
      zone: 'Website',
      q: 'When someone lands on your website, can they understand what you do in 5 seconds?',
      options: [
        { text: 'Yes, very clear', score: 0 },
        { text: 'Somewhat clear', score: 1 },
        { text: 'Not clear', score: 2 },
      ],
    },
    {
      id: 'website_cta',
      zone: 'Website',
      q: 'Is there a clear, easy way for someone to inquire or book on your site?',
      options: [
        { text: 'Yes, form or CTA is obvious', score: 0 },
        { text: 'It exists but is hidden', score: 1 },
        { text: 'No clear way to inquire', score: 2 },
      ],
    },
    {
      id: 'followup_speed',
      zone: 'Follow-up',
      q: 'How fast do you respond to inquiries?',
      options: [
        { text: 'Within 1 hour', score: 0 },
        { text: 'Same day (but not immediately)', score: 1 },
        { text: '24+ hours or inconsistent', score: 2 },
      ],
    },
    {
      id: 'followup_system',
      zone: 'Follow-up',
      q: 'Do you have an automated follow-up system (email/WhatsApp sequences)?',
      options: [
        { text: 'Yes, fully automated', score: 0 },
        { text: 'Partially automated', score: 1 },
        { text: 'No system, manual only', score: 2 },
      ],
    },
    {
      id: 'offer_clarity',
      zone: 'Offer',
      q: 'Is your pricing/offer clear on your website or in early conversations?',
      options: [
        { text: 'Yes, pricing is transparent', score: 0 },
        { text: 'Somewhat clear', score: 1 },
        { text: 'Vague or never discussed upfront', score: 2 },
      ],
    },
    {
      id: 'offer_positioning',
      zone: 'Offer',
      q: 'Can you explain in one sentence why someone should choose you over competitors?',
      options: [
        { text: 'Yes, I have a clear positioning', score: 0 },
        { text: 'Kind of, but it needs work', score: 1 },
        { text: 'Not really', score: 2 },
      ],
    },
    {
      id: 'sales_process',
      zone: 'Sales Process',
      q: 'Do you have a documented sales process your team follows?',
      options: [
        { text: 'Yes, clear steps documented', score: 0 },
        { text: 'Loosely defined', score: 1 },
        { text: 'No process, everyone does their own thing', score: 2 },
      ],
    },
    {
      id: 'sales_objections',
      zone: 'Sales Process',
      q: 'Can you list your top 3 reasons prospects say no?',
      options: [
        { text: 'Yes, and we address them', score: 0 },
        { text: 'Sort of, but not systematically', score: 1 },
        { text: 'No idea why we lose deals', score: 2 },
      ],
    },
    {
      id: 'conversion_rate',
      zone: 'Conversion',
      q: 'What % of inquiries turn into paying clients?',
      options: [
        { text: 'More than 50%', score: 0 },
        { text: '20–50%', score: 1 },
        { text: 'Less than 20% (or don\'t know)', score: 2 },
      ],
    },
    {
      id: 'messaging',
      zone: 'Messaging',
      q: 'Do you emphasize what clients get vs. just describing your services?',
      options: [
        { text: 'Yes, results-focused', score: 0 },
        { text: 'Mix of both', score: 1 },
        { text: 'Just describe what we do', score: 2 },
      ],
    },
  ];

  const zoneImpact = {
    Website: { label: 'Lead Capture', monthly: '₹15K–25K' },
    'Follow-up': { label: 'Conversion Drop-off', monthly: '₹20K–40K' },
    Offer: { label: 'Deal Size Loss', monthly: '₹10K–30K' },
    'Sales Process': { label: 'Close Rate Leak', monthly: '₹25K–50K' },
    Messaging: { label: 'Positioning Weakness', monthly: '₹10K–20K' },
  };

  const calculateLeaks = () => {
    const zoneScores = {};
    Object.entries(responses).forEach(([qId, score]) => {
      const q = questions.find((q) => q.id === qId);
      if (q) {
        zoneScores[q.zone] = (zoneScores[q.zone] || 0) + score;
      }
    });

    return Object.entries(zoneScores)
      .map(([zone, score]) => ({
        zone,
        score,
        severity: score >= 4 ? 'Critical' : score >= 2 ? 'High' : 'Moderate',
        impact: zoneImpact[zone],
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
  };

  const generatePDF = async () => {
    const leaks = calculateLeaks();
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

    // Colors
    const navy = [27, 42, 74];
    const teal = [13, 91, 95];
    const coral = [217, 119, 87];

    // Header
    pdf.setFillColor(...coral);
    pdf.rect(0, 0, 210, 40, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(24);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Revenue Leak Report', 105, 15, { align: 'center' });
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Generated for ${contact.name}`, 105, 28, { align: 'center' });

    // Body
    pdf.setTextColor(...navy);
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');

    let yPos = 55;

    pdf.setFontSize(10);
    pdf.text('Your 3 Biggest Revenue Leaks:', 15, yPos);
    yPos += 8;

    leaks.forEach((leak, i) => {
      pdf.setFillColor(245, 245, 245);
      pdf.rect(15, yPos - 3, 180, 22, 'F');

      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(...navy);
      pdf.text(`${i + 1}. ${leak.zone} — ${leak.severity}`, 20, yPos + 3);

      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(100, 100, 100);
      pdf.setFontSize(9);
      pdf.text(`Likely costing you: ${leak.impact.monthly}/month`, 20, yPos + 10);
      pdf.text(`Issue: ${leak.impact.label}`, 20, yPos + 15);

      yPos += 28;
    });

    yPos += 5;

    // Footer
    pdf.setFontSize(10);
    pdf.setTextColor(...teal);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Next Step', 15, yPos);

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    pdf.setTextColor(60, 60, 60);
    yPos += 6;
    pdf.text(
      'Book a quick KSh 5,000 assessment call. We'll dive deeper into each leak',
      15,
      yPos,
      { maxWidth: 180 }
    );
    yPos += 8;
    pdf.text('and show you exactly what each one is costing you.', 15, yPos);

    pdf.save(`Revenue-Leak-Report-${contact.name.replace(/\s+/g, '-')}.pdf`);
  };

  const handleAnswer = (score) => {
    const q = questions[currentQ];
    setResponses({ ...responses, [q.id]: score });

    if (currentQ < questions.length - 1) {
      setCurrentQ(currentQ + 1);
    } else {
      setStep('results');
    }
  };

  const handleStart = () => {
    if (contact.name.trim() && contact.whatsapp.trim()) {
      setCurrentQ(0);
      setResponses({});
      setStep('questions');
    }
  };

  const leaks = calculateLeaks();

  return (
    <div style={styles.container}>
      {step === 'start' && (
        <div style={styles.card}>
          <div style={styles.header}>
            <h1 style={styles.title}>Revenue Leak Scorecard</h1>
            <p style={styles.subtitle}>
              Find the hidden reasons you're losing deals—in 3 minutes.
            </p>
          </div>

          <div style={styles.form}>
            <label style={styles.label}>Your Name</label>
            <input
              type="text"
              placeholder="Full name"
              value={contact.name}
              onChange={(e) => setContact({ ...contact, name: e.target.value })}
              style={styles.input}
            />

            <label style={styles.label}>WhatsApp Number</label>
            <input
              type="tel"
              placeholder="+254 xxx xxx xxx"
              value={contact.whatsapp}
              onChange={(e) => setContact({ ...contact, whatsapp: e.target.value })}
              style={styles.input}
            />

            <button onClick={handleStart} style={styles.ctaButton}>
              Start Your Diagnostic →
            </button>
          </div>

          <div style={styles.infoBox}>
            <p style={styles.infoText}>
              <strong>What you'll get:</strong> A personalized report showing your 3 biggest revenue leaks and what
              they're costing you monthly.
            </p>
          </div>
        </div>
      )}

      {step === 'questions' && (
        <div style={styles.card}>
          <div style={styles.progressBar}>
            <div
              style={{
                ...styles.progressFill,
                width: `${((currentQ + 1) / questions.length) * 100}%`,
              }}
            />
          </div>

          <div style={styles.questionCard}>
            <div style={styles.questionMeta}>
              <span style={styles.zone}>{questions[currentQ].zone}</span>
              <span style={styles.qNumber}>
                {currentQ + 1} / {questions.length}
              </span>
            </div>

            <h2 style={styles.questionText}>{questions[currentQ].q}</h2>

            <div style={styles.optionsContainer}>
              {questions[currentQ].options.map((option, i) => (
                <button
                  key={i}
                  onClick={() => handleAnswer(option.score)}
                  style={{
                    ...styles.optionButton,
                    borderColor: option.score === 0 ? '#0D5B5F' : option.score === 1 ? '#D97757' : '#C54E3C',
                  }}
                >
                  {option.text}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {step === 'results' && (
        <div style={styles.card}>
          <div style={styles.resultsHeader}>
            <h1 style={styles.resultsTitle}>Your Revenue Leaks</h1>
            <p style={styles.resultsSubtitle}>
              Here's what's costing you money every month.
            </p>
          </div>

          <div style={styles.leaksContainer}>
            {leaks.map((leak, i) => (
              <div key={i} style={styles.leakCard}>
                <div style={styles.leakRank}>{i + 1}</div>
                <div style={styles.leakContent}>
                  <h3 style={styles.leakZone}>{leak.zone}</h3>
                  <p style={styles.leakLabel}>{leak.impact.label}</p>
                  <p style={styles.leakCost}>Costing you: {leak.impact.monthly}/month</p>
                </div>
                <div style={{ ...styles.leakSeverity, backgroundColor: leak.severity === 'Critical' ? '#C54E3C' : leak.severity === 'High' ? '#D97757' : '#E8A89A' }}>
                  {leak.severity}
                </div>
              </div>
            ))}
          </div>

          <div style={styles.ctaBox}>
            <h3 style={styles.ctaTitle}>Next Step</h3>
            <p style={styles.ctaText}>
              Book a quick <strong>KSh 5,000 assessment call</strong>. We'll walk through each leak and show you
              exactly what they're costing you.
            </p>
            <button onClick={generatePDF} style={styles.downloadButton}>
              📥 Download Your Report
            </button>
            <p style={styles.whatsappCTA}>
              Or message us on WhatsApp: <strong>+254 xxx xxx xxx</strong>
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #F9F7F4 0%, #FAFAF9 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    fontFamily: '-apple-system, Segoe UI, Helvetica, Arial, sans-serif',
  },
  card: {
    background: 'white',
    borderRadius: '12px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
    maxWidth: '600px',
    width: '100%',
    padding: '40px',
  },
  header: {
    marginBottom: '30px',
    textAlign: 'center',
  },
  title: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#1B2A4A',
    margin: '0 0 12px 0',
  },
  subtitle: {
    fontSize: '16px',
    color: '#666',
    margin: 0,
  },
  form: {
    marginBottom: '30px',
  },
  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '600',
    color: '#1B2A4A',
    marginBottom: '8px',
    marginTop: '20px',
  },
  input: {
    width: '100%',
    padding: '12px 16px',
    fontSize: '15px',
    border: '2px solid #E0E0E0',
    borderRadius: '8px',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
    transition: 'border-color 0.2s',
    outline: 'none',
  },
  ctaButton: {
    width: '100%',
    padding: '14px',
    marginTop: '24px',
    fontSize: '16px',
    fontWeight: '600',
    color: 'white',
    background: '#0D5B5F',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'background 0.2s',
  },
  infoBox: {
    background: '#F9F7F4',
    borderLeft: '4px solid #D97757',
    padding: '16px',
    borderRadius: '4px',
    marginTop: '20px',
  },
  infoText: {
    margin: 0,
    fontSize: '14px',
    color: '#555',
    lineHeight: 1.5,
  },
  progressBar: {
    height: '4px',
    background: '#E0E0E0',
    borderRadius: '2px',
    marginBottom: '30px',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    background: '#0D5B5F',
    transition: 'width 0.3s ease',
  },
  questionCard: {
    marginTop: '20px',
  },
  questionMeta: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },
  zone: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#D97757',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  qNumber: {
    fontSize: '12px',
    color: '#999',
  },
  questionText: {
    fontSize: '22px',
    fontWeight: '600',
    color: '#1B2A4A',
    margin: '0 0 24px 0',
    lineHeight: 1.4,
  },
  optionsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  optionButton: {
    padding: '14px 16px',
    fontSize: '15px',
    textAlign: 'left',
    background: 'white',
    border: '2px solid #E0E0E0',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    fontWeight: '500',
    color: '#333',
  },
  resultsHeader: {
    textAlign: 'center',
    marginBottom: '30px',
  },
  resultsTitle: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#1B2A4A',
    margin: '0 0 12px 0',
  },
  resultsSubtitle: {
    fontSize: '16px',
    color: '#666',
    margin: 0,
  },
  leaksContainer: {
    marginBottom: '30px',
  },
  leakCard: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '16px',
    padding: '16px',
    background: '#F9F7F4',
    borderRadius: '8px',
    marginBottom: '12px',
    borderLeft: '4px solid #D97757',
  },
  leakRank: {
    fontWeight: 'bold',
    fontSize: '24px',
    color: '#D97757',
    minWidth: '30px',
  },
  leakContent: {
    flex: 1,
  },
  leakZone: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#1B2A4A',
    margin: '0 0 4px 0',
  },
  leakLabel: {
    fontSize: '13px',
    color: '#0D5B5F',
    margin: '0 0 4px 0',
    fontWeight: '500',
  },
  leakCost: {
    fontSize: '13px',
    color: '#666',
    margin: 0,
  },
  leakSeverity: {
    padding: '4px 12px',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: '600',
    color: 'white',
    whiteSpace: 'nowrap',
  },
  ctaBox: {
    background: '#F9F7F4',
    padding: '24px',
    borderRadius: '8px',
    textAlign: 'center',
    borderTop: '3px solid #D97757',
  },
  ctaTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#1B2A4A',
    margin: '0 0 12px 0',
  },
  ctaText: {
    fontSize: '15px',
    color: '#555',
    margin: '0 0 20px 0',
    lineHeight: 1.5,
  },
  downloadButton: {
    padding: '12px 24px',
    fontSize: '15px',
    fontWeight: '600',
    background: '#0D5B5F',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    marginBottom: '16px',
    transition: 'background 0.2s',
  },
  whatsappCTA: {
    fontSize: '14px',
    color: '#0D5B5F',
    margin: 0,
  },
};

export default RevenueLeakScorecard;

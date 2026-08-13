export const projects = [
  {
    id: '01',
    title: 'Diabetic Retinopathy Detection',
    description:
      'CNN trained on 35K+ fundus images across four severity classes. Transfer learning on ResNet-50 with custom classification head, achieving 95.2% accuracy and 0.97 AUC-ROC on held-out test data.',
    tags: ['TensorFlow', 'CNN', 'ResNet-50', 'Computer Vision', 'Healthcare'],
    metrics: ['95.2% Accuracy', '35K+ Images', '0.97 AUC'],
    github: 'https://github.com/arpitjainnn14',
  },
  {
    id: '02',
    title: 'TheraVox — Voice Therapy AI',
    description:
      'Real-time speech therapy app using Wav2Vec2 for phoneme detection and correction. NLP pipeline identifies mispronunciations, generates targeted exercises, and tracks fluency over time.',
    tags: ['PyTorch', 'Wav2Vec2', 'NLP', 'Speech Recognition', 'Healthcare'],
    metrics: ['92% Success Rate', '500+ Sessions', '89% Fluency'],
    github: 'https://github.com/arpitjainnn14',
  },
  {
    id: '03',
    title: 'UPI Fraud Detection',
    description:
      'Ensemble model (XGBoost + LightGBM) for real-time UPI transaction anomaly detection. Sub-50ms inference, trained on 1M+ transactions with synthetic fraud augmentation for class imbalance.',
    tags: ['XGBoost', 'LightGBM', 'FinTech', 'Anomaly Detection'],
    metrics: ['97% Precision', '1M+ Transactions', '<50ms Inference'],
    github: 'https://github.com/arpitjainnn14',
  },
]

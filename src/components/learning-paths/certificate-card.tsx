import type { LearningCertificate, LearningPath } from '@/types/learning-paths';

interface CertificateCardProps {
  certificate: LearningCertificate;
  path: LearningPath;
}

export function CertificateCard({ certificate, path }: CertificateCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <span className={`px-3 py-1 text-sm font-medium rounded-full capitalize ${
          certificate.status === 'issued'
            ? 'bg-green-100 text-green-800'
            : 'bg-red-100 text-red-800'
        }`}>
          {certificate.status}
        </span>
      </div>
      <h3 className="text-lg font-bold mb-2">{path.name}</h3>
      <p className="text-sm text-gray-500 mb-4">
        Issued: {new Date(certificate.issuedAt || '').toLocaleDateString()}
      </p>
      {certificate.certificateUrl && (
        <a
          href={certificate.certificateUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline"
        >
          View Certificate
        </a>
      )}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          Certificate Number: {certificate.certificateNumber}
        </p>
      </div>
    </div>
  );
}

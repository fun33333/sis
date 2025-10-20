import { Copy, Mail, CheckCircle } from 'lucide-react';
import { useState } from 'react';

interface CredentialsDisplayProps {
  employeeCode: string;
  email: string;
  defaultPassword?: string;
  entityType: string;
}

export function CredentialsDisplay({ 
  employeeCode, 
  email, 
  defaultPassword = '12345',
  entityType 
}: CredentialsDisplayProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    const text = `Employee Code: ${employeeCode}\nPassword: ${defaultPassword}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
      <div className="flex items-start gap-3">
        <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="text-sm font-medium text-green-800 mb-2">
            {entityType} Account Created Successfully!
          </h3>
          <div className="space-y-2 text-sm text-green-700">
            <div className="flex items-center gap-2">
              <span className="font-semibold">Employee Code:</span>
              <code className="bg-white px-2 py-1 rounded">{employeeCode}</code>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold">Default Password:</span>
              <code className="bg-white px-2 py-1 rounded">{defaultPassword}</code>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <Mail className="h-3 w-3" />
              <span>Credentials sent to: {email}</span>
            </div>
          </div>
          <button
            onClick={copyToClipboard}
            className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-green-700 bg-green-100 rounded-md hover:bg-green-200 transition-colors"
          >
            <Copy className="h-3 w-3" />
            {copied ? 'Copied!' : 'Copy Credentials'}
          </button>
        </div>
      </div>
    </div>
  );
}

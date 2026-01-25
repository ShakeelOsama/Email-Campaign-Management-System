import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, FileText, X, ArrowLeft, ArrowRight, Check, Mail, User } from 'lucide-react';
import { useCampaignStore } from '../store';
import { Button, Input, TextArea, Card, CardContent, Alert } from '../components/ui';
import type { CreateCampaignPayload } from '../types';

type Step = 1 | 2 | 3;

export function CreateCampaign() {
  const navigate = useNavigate();
  const { createCampaign, uploadRecipients, isLoading, error, clearError } = useCampaignStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [createdCampaignId, setCreatedCampaignId] = useState<number | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadResult, setUploadResult] = useState<{ addedCount: number } | null>(null);
  const [formData, setFormData] = useState<CreateCampaignPayload>({
    name: '',
    subject: '',
    emailContent: '',
    fromName: '',
    fromEmail: '',
    scheduledAt: null,
  });
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof CreateCampaignPayload, string>>>({});

  const steps = [
    { number: 1, title: 'Campaign Details', description: 'Basic information about your campaign' },
    { number: 2, title: 'Email Content', description: 'Compose your email message' },
    { number: 3, title: 'Recipients', description: 'Upload your recipient list' },
  ];

  const validateStep1 = () => {
    const errors: Partial<Record<keyof CreateCampaignPayload, string>> = {};
    if (!formData.name.trim()) errors.name = 'Campaign name is required';
    if (!formData.fromName.trim()) errors.fromName = 'Sender name is required';
    if (!formData.fromEmail.trim()) errors.fromEmail = 'Sender email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.fromEmail)) {
      errors.fromEmail = 'Invalid email address';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateStep2 = () => {
    const errors: Partial<Record<keyof CreateCampaignPayload, string>> = {};
    if (!formData.subject.trim()) errors.subject = 'Email subject is required';
    if (!formData.emailContent.trim()) errors.emailContent = 'Email content is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = async () => {
    clearError();
    if (currentStep === 1) {
      if (validateStep1()) setCurrentStep(2);
    } else if (currentStep === 2) {
      if (validateStep2()) {
        try {
          const campaign = await createCampaign(formData);
          setCreatedCampaignId(campaign.id);
          setCurrentStep(3);
        } catch (err) {
          // Error is handled by the store
        }
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as Step);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name as keyof CreateCampaignPayload]) {
      setFormErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.endsWith('.csv')) {
        setFormErrors({ ...formErrors });
        return;
      }
      setUploadedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!uploadedFile || !createdCampaignId) return;
    try {
      const result = await uploadRecipients(createdCampaignId, uploadedFile);
      setUploadResult(result);
    } catch (err) {
      // Error is handled by the store
    }
  };

  const handleFinish = () => {
    navigate(`/campaigns/${createdCampaignId}`);
  };

  const handleSkipUpload = () => {
    navigate(`/campaigns/${createdCampaignId}`);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Page Header */}
      <div>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-400 hover:text-white mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </button>
        <h1 className="text-2xl font-bold text-white">Create New Campaign</h1>
        <p className="text-gray-400 mt-1">Set up your email campaign in a few simple steps</p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <React.Fragment key={step.number}>
            <div className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-medium transition-colors ${
                  currentStep >= step.number
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-800 text-gray-500'
                }`}
              >
                {currentStep > step.number ? (
                  <Check className="w-5 h-5" />
                ) : (
                  step.number
                )}
              </div>
              <div className="ml-3 hidden sm:block">
                <p
                  className={`text-sm font-medium ${
                    currentStep >= step.number ? 'text-white' : 'text-gray-500'
                  }`}
                >
                  {step.title}
                </p>
                <p className="text-xs text-gray-500">{step.description}</p>
              </div>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-4 ${
                  currentStep > step.number ? 'bg-indigo-600' : 'bg-gray-800'
                }`}
              />
            )}
          </React.Fragment>
        ))}
      </div>

      {error && (
        <Alert type="error" message={error} onClose={clearError} />
      )}

      {/* Step Content */}
      <Card>
        <CardContent className="py-8">
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center">
                  <Mail className="w-6 h-6 text-indigo-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">Campaign Details</h2>
                  <p className="text-sm text-gray-400">Enter the basic information for your campaign</p>
                </div>
              </div>

              <Input
                label="Campaign Name"
                name="name"
                placeholder="e.g., Summer Sale Announcement"
                value={formData.name}
                onChange={handleInputChange}
                error={formErrors.name}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Sender Name"
                  name="fromName"
                  placeholder="e.g., John from Company"
                  value={formData.fromName}
                  onChange={handleInputChange}
                  error={formErrors.fromName}
                />
                <Input
                  label="Sender Email"
                  name="fromEmail"
                  type="email"
                  placeholder="e.g., john@company.com"
                  value={formData.fromEmail}
                  onChange={handleInputChange}
                  error={formErrors.fromEmail}
                />
              </div>

              <Input
                label="Schedule (Optional)"
                name="scheduledAt"
                type="datetime-local"
                value={formData.scheduledAt || ''}
                onChange={handleInputChange}
                helperText="Leave empty to save as draft"
              />
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                  <FileText className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">Email Content</h2>
                  <p className="text-sm text-gray-400">Compose your email message</p>
                </div>
              </div>

              <Input
                label="Email Subject"
                name="subject"
                placeholder="e.g., Don't miss our biggest sale of the year!"
                value={formData.subject}
                onChange={handleInputChange}
                error={formErrors.subject}
              />

              <TextArea
                label="Email Body (HTML)"
                name="emailContent"
                placeholder="<html>
  <body>
    <h1>Hello {{firstName}}!</h1>
    <p>Your email content here...</p>
  </body>
</html>"
                value={formData.emailContent}
                onChange={handleInputChange}
                error={formErrors.emailContent}
                rows={12}
              />

              <div className="p-4 bg-gray-800/50 rounded-xl">
                <p className="text-sm text-gray-400">
                  <span className="font-medium text-white">Available variables:</span>
                  <br />
                  <code className="text-indigo-400">{'{{firstName}}'}</code> - Recipient's first name
                  <br />
                  <code className="text-indigo-400">{'{{email}}'}</code> - Recipient's email address
                </p>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                  <User className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">Upload Recipients</h2>
                  <p className="text-sm text-gray-400">Upload a CSV file with your recipient list</p>
                </div>
              </div>

              {!uploadResult ? (
                <>
                  <div
                    className={`border-2 border-dashed rounded-2xl p-8 text-center transition-colors ${
                      uploadedFile
                        ? 'border-indigo-500/50 bg-indigo-500/10'
                        : 'border-gray-700 hover:border-gray-600'
                    }`}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".csv"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <Upload className={`w-12 h-12 mx-auto mb-4 ${uploadedFile ? 'text-indigo-400' : 'text-gray-500'}`} />
                    {uploadedFile ? (
                      <div className="flex items-center justify-center space-x-2">
                        <FileText className="w-5 h-5 text-indigo-400" />
                        <span className="text-white font-medium">{uploadedFile.name}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setUploadedFile(null);
                          }}
                          className="p-1 hover:bg-gray-700 rounded-lg transition-colors"
                        >
                          <X className="w-4 h-4 text-gray-400" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <p className="text-white font-medium mb-1">
                          Click to upload or drag and drop
                        </p>
                        <p className="text-sm text-gray-400">CSV file up to 10MB</p>
                      </>
                    )}
                  </div>

                  <div className="p-4 bg-gray-800/50 rounded-xl">
                    <p className="text-sm text-gray-400">
                      <span className="font-medium text-white">CSV Format:</span>
                      <br />
                      Your CSV should have headers: <code className="text-indigo-400">email,name</code>
                      <br />
                      Example: <code className="text-gray-300">john@example.com,John Doe</code>
                    </p>
                  </div>

                  {uploadedFile && (
                    <Button
                      onClick={handleUpload}
                      isLoading={isLoading}
                      leftIcon={<Upload className="w-4 h-4" />}
                      className="w-full"
                    >
                      Upload Recipients
                    </Button>
                  )}
                </>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="w-8 h-8 text-green-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Recipients Uploaded Successfully!
                  </h3>
                  <p className="text-gray-400">
                    {uploadResult.addedCount} recipients have been added to your campaign.
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        {currentStep > 1 && currentStep < 3 && (
          <Button variant="secondary" onClick={handleBack} leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Back
          </Button>
        )}
        {currentStep === 1 && <div />}
        
        {currentStep < 3 && (
          <Button
            onClick={handleNext}
            isLoading={isLoading}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            {currentStep === 2 ? 'Create Campaign' : 'Next'}
          </Button>
        )}

        {currentStep === 3 && (
          <div className="flex gap-3 ml-auto">
            {!uploadResult && (
              <Button variant="secondary" onClick={handleSkipUpload}>
                Skip for Now
              </Button>
            )}
            <Button onClick={handleFinish} leftIcon={<Check className="w-4 h-4" />}>
              View Campaign
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

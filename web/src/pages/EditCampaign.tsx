import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { useCampaignStore } from '../store';
import { Button, Input, TextArea, Card, CardContent, Alert, PageLoader } from '../components/ui';
import type { UpdateCampaignPayload } from '../types';

export function EditCampaign() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    currentCampaign,
    isLoading,
    error,
    fetchCampaign,
    updateCampaign,
    clearError,
    clearCurrentCampaign,
  } = useCampaignStore();

  const [formData, setFormData] = useState<UpdateCampaignPayload>({
    name: '',
    subject: '',
    emailContent: '',
    fromName: '',
    fromEmail: '',
    scheduledAt: null,
  });
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof UpdateCampaignPayload, string>>>({});
  const [saving, setSaving] = useState(false);

  const campaignId = Number(id);

  useEffect(() => {
    if (campaignId) {
      fetchCampaign(campaignId);
    }

    return () => {
      clearCurrentCampaign();
    };
  }, [campaignId, fetchCampaign, clearCurrentCampaign]);

  useEffect(() => {
    if (currentCampaign) {
      setFormData({
        name: currentCampaign.name,
        subject: currentCampaign.subject,
        emailContent: currentCampaign.emailContent,
        fromName: currentCampaign.fromName,
        fromEmail: currentCampaign.fromEmail,
        scheduledAt: currentCampaign.scheduledAt,
      });
    }
  }, [currentCampaign]);

  const validate = () => {
    const errors: Partial<Record<keyof UpdateCampaignPayload, string>> = {};
    if (!formData.name?.trim()) errors.name = 'Campaign name is required';
    if (!formData.subject?.trim()) errors.subject = 'Subject is required';
    if (!formData.emailContent?.trim()) errors.emailContent = 'Email content is required';
    if (!formData.fromName?.trim()) errors.fromName = 'Sender name is required';
    if (!formData.fromEmail?.trim()) errors.fromEmail = 'Sender email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.fromEmail)) {
      errors.fromEmail = 'Invalid email address';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name as keyof UpdateCampaignPayload]) {
      setFormErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    try {
      await updateCampaign(campaignId, formData);
      navigate(`/campaigns/${campaignId}`);
    } catch (err) {
      // Error handled by store
    }
    setSaving(false);
  };

  if (isLoading && !currentCampaign) {
    return <PageLoader />;
  }

  if (!currentCampaign) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-white mb-2">Campaign not found</h2>
        <Button onClick={() => navigate('/campaigns')}>Back to Campaigns</Button>
      </div>
    );
  }

  if (currentCampaign.status !== 'draft') {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-white mb-2">Cannot edit this campaign</h2>
        <p className="text-gray-400 mb-4">Only draft campaigns can be edited.</p>
        <Button onClick={() => navigate(`/campaigns/${campaignId}`)}>View Campaign</Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-400 hover:text-white mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </button>
        <h1 className="text-2xl font-bold text-white">Edit Campaign</h1>
        <p className="text-gray-400 mt-1">Update your campaign details</p>
      </div>

      {error && <Alert type="error" message={error} onClose={clearError} />}

      <form onSubmit={handleSubmit}>
        <Card>
          <CardContent className="py-6 space-y-6">
            <Input
              label="Campaign Name"
              name="name"
              placeholder="e.g., Summer Sale Announcement"
              value={formData.name || ''}
              onChange={handleInputChange}
              error={formErrors.name}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Sender Name"
                name="fromName"
                placeholder="e.g., John from Company"
                value={formData.fromName || ''}
                onChange={handleInputChange}
                error={formErrors.fromName}
              />
              <Input
                label="Sender Email"
                name="fromEmail"
                type="email"
                placeholder="e.g., john@company.com"
                value={formData.fromEmail || ''}
                onChange={handleInputChange}
                error={formErrors.fromEmail}
              />
            </div>

            <Input
              label="Email Subject"
              name="subject"
              placeholder="e.g., Don't miss our biggest sale of the year!"
              value={formData.subject || ''}
              onChange={handleInputChange}
              error={formErrors.subject}
            />

            <TextArea
              label="Email Body (HTML)"
              name="emailContent"
              placeholder="Your email content here..."
              value={formData.emailContent || ''}
              onChange={handleInputChange}
              error={formErrors.emailContent}
              rows={12}
            />

            <Input
              label="Schedule (Optional)"
              name="scheduledAt"
              type="datetime-local"
              value={formData.scheduledAt || ''}
              onChange={handleInputChange}
              helperText="Leave empty to keep as draft"
            />
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3 mt-6">
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate(`/campaigns/${campaignId}`)}
          >
            Cancel
          </Button>
          <Button type="submit" isLoading={saving} leftIcon={<Save className="w-4 h-4" />}>
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}

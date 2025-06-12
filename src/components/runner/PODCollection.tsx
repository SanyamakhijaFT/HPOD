import React, { useState, useEffect } from 'react';
import {
  Play,
  CheckCircle,
  Truck,
  User,
  Clock,
  Camera,
  Upload,
  X,
  AlertTriangle,
  Loader2,
  FileText,
  Package,
} from 'lucide-react';
import { Trip } from '../../types';

interface PODCollectionProps {
  trip: Trip;
  onUpdateTrip: (tripId: string, updates: Partial<Trip>) => void;
}

const statusSteps = [
  { key: 'assigned', label: 'Assigned', icon: User },
  { key: 'in_progress', label: 'Picked Up', icon: Clock },
  { key: 'pod_collected', label: 'POD Collected', icon: CheckCircle },
  { key: 'couriered', label: 'Couriered', icon: Truck },
];

const courierOptions = [
  'Blue Dart',
  'DTDC',
  'DHL',
  'FedEx',
  'Delhivery',
  'Hand Delivered',
  'Other',
];

const issueTypes = [
  'FO Unavailable',
  'Address Not Found',
  'Already Couriered',
  'POD Not Ready',
  'Other Issue',
];

const PODCollection: React.FC<PODCollectionProps> = ({ trip, onUpdateTrip }) => {
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>(trip.podImages || []);
  const [courierPartner, setCourierPartner] = useState(trip.courierPartner || '');
  const [awbNumber, setAwbNumber] = useState(trip.awbNumber || '');
  const [courierDate, setCourierDate] = useState(trip.courierDate || '');
  const [courierComments, setCourierComments] = useState(trip.courierComments || '');
  const [showIssueForm, setShowIssueForm] = useState(false);
  const [issueType, setIssueType] = useState('');
  const [issueDescription, setIssueDescription] = useState('');
  const [loading, setLoading] = useState(false);

  // Update local state when trip prop changes
  useEffect(() => {
    setUploadedFiles(trip.podImages || []);
    setCourierPartner(trip.courierPartner || '');
    setAwbNumber(trip.awbNumber || '');
    setCourierDate(trip.courierDate || '');
    setCourierComments(trip.courierComments || '');
  }, [trip]);

  const currentStepIndex = statusSteps.findIndex(step => step.key === trip.status);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    setUploading(true);
    
    try {
      // Simulate file upload
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const newFiles = Array.from(files).map(file => file.name);
      const updatedFiles = [...uploadedFiles, ...newFiles];
      
      setUploadedFiles(updatedFiles);
      
      // Update trip with new images
      onUpdateTrip(trip.id, { podImages: updatedFiles });
    } catch (error) {
      console.error('Error uploading files:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveFile = (fileName: string) => {
    const updatedFiles = uploadedFiles.filter(file => file !== fileName);
    setUploadedFiles(updatedFiles);
    onUpdateTrip(trip.id, { podImages: updatedFiles });
  };

  const handleStatusChange = async (newStatus: string) => {
    setLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const updates: Partial<Trip> = { 
        status: newStatus as Trip['status']
      };
      
      // Add specific data based on the new status
      if (newStatus === 'pod_collected') {
        updates.podImages = uploadedFiles;
      }
      
      if (newStatus === 'couriered') {
        updates.courierPartner = courierPartner;
        updates.awbNumber = awbNumber;
        updates.courierDate = courierDate || new Date().toISOString().split('T')[0];
        updates.courierComments = courierComments;
        updates.podImages = uploadedFiles;
      }
      
      onUpdateTrip(trip.id, updates);
    } catch (error) {
      console.error('Error updating trip status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReportIssue = async () => {
    if (!issueType) return;
    
    setLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const updates = {
        issueReported: {
          type: issueType,
          description: issueDescription || '',
          reportedAt: new Date().toISOString(),
        }
      };
      
      onUpdateTrip(trip.id, updates);
      
      setShowIssueForm(false);
      setIssueType('');
      setIssueDescription('');
    } catch (error) {
      console.error('Error reporting issue:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResumeAfterIssue = async () => {
    setLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Clear the issue and allow runner to continue
      const updates = {
        issueReported: undefined
      };
      
      onUpdateTrip(trip.id, updates);
    } catch (error) {
      console.error('Error resuming trip:', error);
    } finally {
      setLoading(false);
    }
  };

  // Validation logic
  const canPickUp = trip.status === 'assigned';
  const canCollectPOD = trip.status === 'in_progress' && uploadedFiles.length > 0;
  const canMarkCouriered = trip.status === 'pod_collected' && courierPartner && awbNumber;

  // If trip is completed (couriered), show completion message
  if (trip.status === 'couriered') {
    return (
      <div className="bg-white rounded-lg p-4 sm:p-6">
        <div className="text-center">
          <CheckCircle className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-green-500" />
          <h3 className="mt-2 text-base sm:text-lg font-semibold text-gray-900">Task Completed</h3>
          <p className="mt-1 text-sm text-gray-600">
            POD has been successfully collected and couriered.
          </p>
          {trip.courierPartner && (
            <div className="mt-4 p-3 sm:p-4 bg-green-50 rounded-lg">
              <div className="text-sm">
                <div className="font-medium text-green-800">Courier Details:</div>
                <div className="text-green-700">
                  {trip.courierPartner} • {trip.awbNumber}
                  {trip.courierDate && (
                    <div className="text-xs">Date: {new Date(trip.courierDate).toLocaleDateString()}</div>
                  )}
                  {trip.courierComments && (
                    <div className="text-xs mt-1">Comments: {trip.courierComments}</div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // If issue is reported, show issue details and resume option
  if (trip.issueReported) {
    return (
      <div className="bg-white rounded-lg p-4 sm:p-6">
        <div className="text-center">
          <AlertTriangle className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-red-500" />
          <h3 className="mt-2 text-base sm:text-lg font-semibold text-gray-900">Issue Reported</h3>
          <div className="mt-4 p-3 sm:p-4 bg-red-50 rounded-lg text-left">
            <div className="text-sm">
              <div className="font-medium text-red-800">Issue Type:</div>
              <div className="text-red-700">{trip.issueReported.type}</div>
              {trip.issueReported.description && (
                <>
                  <div className="font-medium text-red-800 mt-2">Description:</div>
                  <div className="text-red-700">{trip.issueReported.description}</div>
                </>
              )}
              <div className="text-xs text-red-600 mt-2">
                Reported: {new Date(trip.issueReported.reportedAt).toLocaleString()}
              </div>
            </div>
          </div>
          
          {/* Resume Button */}
          <div className="mt-4">
            <button
              onClick={handleResumeAfterIssue}
              disabled={loading}
              className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="animate-spin h-4 w-4 mr-2" />
              ) : (
                <Play className="h-4 w-4 mr-2" />
              )}
              {loading ? 'Resuming...' : 'Resume Task'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-4 sm:p-6">
      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 sm:mb-6">
        POD Collection - {trip.id}
      </h3>

      {/* Status Progress Timeline */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center justify-between relative">
          {statusSteps.map((step, index) => {
            const StepIcon = step.icon;
            const isCompleted = index < currentStepIndex;
            const isActive = index === currentStepIndex;

            return (
              <div key={step.key} className="flex flex-col items-center flex-1 relative">
                <div className={`flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 ${
                  isCompleted 
                    ? 'bg-green-500 border-green-500 text-white'
                    : isActive
                    ? 'bg-blue-500 border-blue-500 text-white'
                    : 'bg-gray-100 border-gray-300 text-gray-400'
                }`}>
                  <StepIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <div className={`mt-2 text-xs font-medium text-center ${
                  isCompleted 
                    ? 'text-green-600'
                    : isActive
                    ? 'text-blue-600'
                    : 'text-gray-400'
                }`}>
                  {step.label}
                </div>
                {index < statusSteps.length - 1 && (
                  <div className={`absolute top-4 sm:top-5 left-1/2 w-full h-0.5 ${
                    isCompleted ? 'bg-green-500' : 'bg-gray-300'
                  }`} style={{ transform: 'translateX(50%)', zIndex: -1 }} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Dynamic Action Button */}
      <div className="mb-4 sm:mb-6">
        {trip.status === 'assigned' && (
          <button
            onClick={() => handleStatusChange('in_progress')}
            disabled={loading}
            className="w-full flex items-center justify-center px-4 py-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="animate-spin h-4 w-4 mr-2" />
            ) : (
              <Package className="h-4 w-4 mr-2" />
            )}
            {loading ? 'Picking Up...' : 'Pick Up Trip'}
          </button>
        )}

        {trip.status === 'in_progress' && (
          <button
            onClick={() => handleStatusChange('pod_collected')}
            disabled={!canCollectPOD || loading}
            className="w-full flex items-center justify-center px-4 py-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="animate-spin h-4 w-4 mr-2" />
            ) : (
              <CheckCircle className="h-4 w-4 mr-2" />
            )}
            {loading ? 'Collecting...' : 'Mark POD Collected'}
          </button>
        )}

        {trip.status === 'pod_collected' && (
          <button
            onClick={() => handleStatusChange('couriered')}
            disabled={!canMarkCouriered || loading}
            className="w-full flex items-center justify-center px-4 py-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="animate-spin h-4 w-4 mr-2" />
            ) : (
              <Truck className="h-4 w-4 mr-2" />
            )}
            {loading ? 'Couriering...' : 'Mark as Couriered'}
          </button>
        )}
      </div>

      {/* Proof of Receipt Upload Section - Only show after picking up */}
      {trip.status === 'in_progress' && (
        <div className="mb-4 sm:mb-6">
          <h4 className="text-sm font-medium text-gray-900 mb-3">
            Proof of Receipt <span className="text-red-500">*</span>
          </h4>
          <p className="text-xs text-gray-600 mb-3">
            Upload photos of the POD documents before marking as collected
          </p>
          
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-3 sm:p-4">
            <div className="text-center">
              <Upload className="mx-auto h-6 w-6 sm:h-8 sm:w-8 text-gray-400" />
              <div className="mt-2">
                <label htmlFor="file-upload" className="cursor-pointer">
                  <span className="text-sm font-medium text-blue-600 hover:text-blue-500">
                    Upload photos
                  </span>
                  <input
                    id="file-upload"
                    name="file-upload"
                    type="file"
                    className="sr-only"
                    multiple
                    accept="image/*"
                    onChange={handleFileUpload}
                  />
                </label>
                <span className="text-sm text-gray-500"> or </span>
                <button className="text-sm font-medium text-blue-600 hover:text-blue-500">
                  <Camera className="inline h-4 w-4 mr-1" />
                  Take Photo
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                PNG, JPG up to 10MB each
              </p>
            </div>
          </div>

          {uploading && (
            <div className="mt-2 flex items-center text-sm text-gray-600">
              <Loader2 className="animate-spin h-4 w-4 mr-2" />
              Uploading photos...
            </div>
          )}

          {uploadedFiles.length > 0 && (
            <div className="mt-4 space-y-2">
              <h5 className="text-xs font-medium text-gray-700">Uploaded Photos:</h5>
              {uploadedFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex items-center min-w-0 flex-1">
                    <FileText className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                    <span className="text-sm text-gray-700 truncate">{file}</span>
                  </div>
                  <button
                    onClick={() => handleRemoveFile(file)}
                    className="text-red-500 hover:text-red-700 ml-2 flex-shrink-0"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {uploadedFiles.length === 0 && (
            <p className="text-xs text-red-600 mt-2">
              Upload at least one photo to proceed
            </p>
          )}
        </div>
      )}

      {/* Courier Details Section - Only show after POD collected */}
      {trip.status === 'pod_collected' && (
        <div className="mb-4 sm:mb-6">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Courier Details</h4>
          
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Courier Partner <span className="text-red-500">*</span>
              </label>
              <select
                value={courierPartner}
                onChange={(e) => setCourierPartner(e.target.value)}
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                <option value="">Select courier partner</option>
                {courierOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                AWB/Docket Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={awbNumber}
                onChange={(e) => setAwbNumber(e.target.value)}
                placeholder="Enter AWB or docket number"
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Courier Date (Optional)
              </label>
              <input
                type="date"
                value={courierDate}
                onChange={(e) => setCourierDate(e.target.value)}
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Comments (Optional)
              </label>
              <textarea
                value={courierComments}
                onChange={(e) => setCourierComments(e.target.value)}
                placeholder="Add any comments about the courier..."
                rows={3}
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>
          </div>

          {(!courierPartner || !awbNumber) && (
            <p className="text-xs text-red-600 mt-2">
              Fill courier partner and AWB number to proceed
            </p>
          )}
        </div>
      )}

      {/* Issue Reporting */}
      {trip.status !== 'couriered' && (
        <div className="border-t border-gray-200 pt-4 sm:pt-6">
          {!showIssueForm ? (
            <button
              onClick={() => setShowIssueForm(true)}
              className="w-full flex items-center justify-center px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              Report Issue
            </button>
          ) : (
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-900">Report Issue</h4>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Issue Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={issueType}
                  onChange={(e) => setIssueType(e.target.value)}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 text-sm"
                >
                  <option value="">Select issue type</option>
                  {issueTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Description (Optional)
                </label>
                <textarea
                  value={issueDescription}
                  onChange={(e) => setIssueDescription(e.target.value)}
                  placeholder="Please describe the issue..."
                  rows={3}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 text-sm"
                />
              </div>

              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                <button
                  onClick={handleReportIssue}
                  disabled={!issueType || loading}
                  className="flex-1 flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 className="animate-spin h-4 w-4 mr-2" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 mr-2" />
                  )}
                  {loading ? 'Submitting...' : 'Submit Report'}
                </button>
                <button
                  onClick={() => {
                    setShowIssueForm(false);
                    setIssueType('');
                    setIssueDescription('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PODCollection;
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Building, MapPin, DollarSign, UploadCloud, Banknote } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import propertyService from '../services/propertyService';

const AddProperty = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    location: '',
    type: 'Apartment',
    beds: '',
    baths: '',
    area: '',
    status: 'For Sale'
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (selectedFiles.length === 0) {
      alert("Please upload at least one image.");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const projectData = {
        title: formData.title,
        description: formData.description,
        location_address: formData.location,
        city: 'Default City',
        state: 'Default State',
        pincode: '000000',
        total_budget: parseFloat(formData.price) || 0,
        total_bricks: 10000,
        face_value: 100,
        ipo_price: 100,
        expected_completion_date: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString(),
        milestones: [
          {
            milestone_number: 1,
            description: "Initial Phase",
            release_percentage: 100.0
          }
        ]
      };
      
      await propertyService.createProject(projectData, selectedFiles);
      navigate('/dashboard');
    } catch (error) {
      console.error("Failed to list property:", error);
      alert("Failed to create property. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-secondary-900 dark:text-white font-heading">
          Add New Property
        </h1>
        <p className="mt-2 text-secondary-600 dark:text-secondary-400">
          List a new property for investment on the EstateX platform.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Enter the primary details for the property listing.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Input
              label="Property Title"
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Luxury Penthouse in Downtown"
            />
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-secondary-700 dark:text-secondary-300">Description</label>
              <textarea
                name="description"
                required
                rows={4}
                value={formData.description}
                onChange={handleChange}
                className="w-full rounded-xl border border-secondary-200 bg-white px-3 py-2 text-sm text-secondary-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-secondary-800 dark:bg-slate-900/50 dark:text-secondary-100"
                placeholder="Describe the property, its features, and surrounding area..."
              />
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <Input
                label="Asking Price (₹)"
                name="price"
                type="number"
                required
                icon={DollarSign}
                value={formData.price}
                onChange={handleChange}
                placeholder="1000000"
              />
              <Input
                label="Location / Address"
                name="location"
                required
                icon={MapPin}
                value={formData.location}
                onChange={handleChange}
                placeholder="New York, NY"
              />
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-secondary-700 dark:text-secondary-300">Property Type</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="flex h-11 w-full rounded-xl border border-secondary-200 bg-white px-3 py-2 text-sm text-secondary-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 dark:border-secondary-800 dark:bg-slate-900/50 dark:text-secondary-100"
                >
                  <option value="Apartment">Apartment</option>
                  <option value="House">House</option>
                  <option value="Villa">Villa</option>
                  <option value="Commercial">Commercial</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-secondary-700 dark:text-secondary-300">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="flex h-11 w-full rounded-xl border border-secondary-200 bg-white px-3 py-2 text-sm text-secondary-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 dark:border-secondary-800 dark:bg-slate-900/50 dark:text-secondary-100"
                >
                  <option value="For Sale">For Sale</option>
                  <option value="Off-Plan">Off-Plan</option>
                  <option value="Upcoming">Upcoming</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Specifications</CardTitle>
            <CardDescription>Technical details and dimensions.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            <Input
              label="Bedrooms"
              name="beds"
              type="number"
              value={formData.beds}
              onChange={handleChange}
              placeholder="3"
            />
            <Input
              label="Bathrooms"
              name="baths"
              type="number"
              step="0.5"
              value={formData.baths}
              onChange={handleChange}
              placeholder="2.5"
            />
            <Input
              label="Area (Sq Ft)"
              name="area"
              type="number"
              value={formData.area}
              onChange={handleChange}
              placeholder="2000"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Media & Documents</CardTitle>
            <CardDescription>Upload high-quality images and legal documents.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="rounded-2xl border-2 border-dashed border-secondary-300 bg-secondary-50 px-6 py-12 text-center dark:border-secondary-700 dark:bg-secondary-900/20">
               <UploadCloud className="mx-auto h-12 w-12 text-secondary-400" />
               <div className="mt-4 flex flex-col items-center text-sm leading-6 text-secondary-600 dark:text-secondary-400">
                 <label htmlFor="file-upload" className="relative cursor-pointer rounded-md bg-transparent font-semibold text-primary-600 focus-within:outline-none hover:text-primary-500 dark:text-primary-400">
                   <span>Upload files</span>
                   <input onChange={handleFileChange} id="file-upload" name="file-upload" type="file" className="sr-only" multiple accept="image/*" />
                 </label>
                 <p className="pl-1">or drag and drop</p>
               </div>
               <p className="text-xs leading-5 text-secondary-500 mt-2">PNG, JPG up to 10MB</p>
               {selectedFiles.length > 0 && (
                 <div className="mt-4 text-sm text-secondary-700 dark:text-secondary-300 text-left">
                   <p className="font-semibold mb-2">Selected Images:</p>
                   <ul className="list-disc pl-5">
                     {selectedFiles.map((file, index) => (
                       <li key={index}>{file.name}</li>
                     ))}
                   </ul>
                 </div>
               )}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button variant="outline" type="button" onClick={() => navigate('/dashboard')}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting} leftIcon={<Building size={18} />}>
            List Property
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddProperty;

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Building, MapPin, DollarSign, UploadCloud, Banknote, Calendar, Layers } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import propertyService from '../services/propertyService';

const AddProperty = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location_address: '',
    city: '',
    state: '',
    pincode: '',
    total_budget: '',
    face_value: '',
    ipo_price: '',
    type: 'Apartment',
    beds: '',
    baths: '',
    area: '',
    expected_completion_date: '',
    status: 'Upcoming'
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  // Auto calculate bricks correctly
  const totalBricks = formData.total_budget && formData.face_value 
      ? Math.floor(parseFloat(formData.total_budget) / parseFloat(formData.face_value)) 
      : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (selectedFiles.length === 0) {
      alert("Please upload at least one image.");
      return;
    }

    if (totalBricks <= 0) {
      alert("Invalid financial configuration. Total Bricks must be greater than zero.");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Structure the data to strictly match our backend ProjectCreate Schema
      const projectData = {
        title: formData.title,
        description: formData.description,
        location_address: formData.location_address,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
        total_budget: parseFloat(formData.total_budget),
        total_bricks: totalBricks,
        face_value: parseFloat(formData.face_value),
        ipo_price: parseFloat(formData.ipo_price),
        expected_completion_date: formData.expected_completion_date ? new Date(formData.expected_completion_date).toISOString() : null,
        milestones: [
          {
            milestone_number: 1,
            description: "Phase 1: Project Initiation & Land Verification",
            release_percentage: 20.0
          },
          {
            milestone_number: 2,
            description: "Phase 2: Foundation & Framing",
            release_percentage: 40.0
          },
          {
            milestone_number: 3,
            description: "Phase 3: Final Completion & Handover",
            release_percentage: 40.0
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
          Launch New IPO Project
        </h1>
        <p className="mt-2 text-secondary-600 dark:text-secondary-400">
          Create and list a new fractionalized property offering on EstateX.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* SECTION 1: BASIC INFORMATION */}
        <Card>
          <CardHeader>
            <CardTitle>Overview</CardTitle>
            <CardDescription>Primary details outlining this Real Estate project.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Input
              label="Project Title"
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. The Sapphire Penthouses"
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
                placeholder="Detail the uniqueness, architecture, and core value proposition of this project..."
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
                <label className="text-sm font-medium text-secondary-700 dark:text-secondary-300">Listing Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="flex h-11 w-full rounded-xl border border-secondary-200 bg-white px-3 py-2 text-sm text-secondary-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 dark:border-secondary-800 dark:bg-slate-900/50 dark:text-secondary-100"
                >
                  <option value="Upcoming">Upcoming IPO</option>
                  <option value="Off-Plan">Off-Plan</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* SECTION 2: LOCATION */}
        <Card>
          <CardHeader>
            <CardTitle>Location Info</CardTitle>
            <CardDescription>Accurate geographical data helps investors analyze market yield.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Input
              label="Street Address / Locality"
              name="location_address"
              required
              icon={MapPin}
              value={formData.location_address}
              onChange={handleChange}
              placeholder="123 Financial District Ave"
            />
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              <Input
                label="City"
                name="city"
                required
                value={formData.city}
                onChange={handleChange}
                placeholder="Mumbai"
              />
               <Input
                label="State"
                name="state"
                required
                value={formData.state}
                onChange={handleChange}
                placeholder="Maharashtra"
              />
               <Input
                label="Pincode"
                name="pincode"
                required
                value={formData.pincode}
                onChange={handleChange}
                placeholder="400001"
              />
            </div>
          </CardContent>
        </Card>

        {/* SECTION 3: ESTATE-X FINANCIALS */}
        <Card>
          <CardHeader>
            <CardTitle>Financials & Bricks</CardTitle>
            <CardDescription>Setup fractional tokenization metrics for the property.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              <Input
                label="Total Target Budget (₹)"
                name="total_budget"
                type="number"
                required
                icon={DollarSign}
                value={formData.total_budget}
                onChange={handleChange}
                placeholder="50000000"
              />
              <Input
                label="Face Value per Brick (₹)"
                name="face_value"
                type="number"
                required
                icon={Banknote}
                value={formData.face_value}
                onChange={handleChange}
                placeholder="100"
              />
              <Input
                label="IPO Launch Price (₹)"
                name="ipo_price"
                type="number"
                required
                icon={Banknote}
                value={formData.ipo_price}
                onChange={handleChange}
                placeholder="105"
              />
            </div>
            
            {/* Display Auto Calculated Bricks */}
             <div className="p-4 bg-primary-50 dark:bg-primary-900/20 rounded-xl border border-primary-100 dark:border-primary-800/30 flex items-center gap-4">
                <div className="p-3 bg-primary-100 dark:bg-primary-800 rounded-lg text-primary-700 dark:text-primary-300">
                   <Layers size={24} />
                </div>
                <div>
                   <p className="text-sm font-medium text-secondary-600 dark:text-secondary-400">Calculated Total Bricks to be Issued</p>
                   <p className="text-2xl font-bold text-primary-700 dark:text-primary-400">
                     {totalBricks.toLocaleString()}
                   </p>
                </div>
             </div>
          </CardContent>
        </Card>

        {/* SECTION 4: SPECIFICATIONS */}
        <Card>
          <CardHeader>
            <CardTitle>Specifications & Timeline</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
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
            <Input
              label="Est. Completion"
              name="expected_completion_date"
              type="date"
              icon={Calendar}
              required
              value={formData.expected_completion_date}
              onChange={handleChange}
            />
          </CardContent>
        </Card>

        {/* SECTION 5: MEDIA */}
        <Card>
          <CardHeader>
            <CardTitle>Media & Documents</CardTitle>
            <CardDescription>Upload high-quality images of the property.</CardDescription>
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

        {/* SUBMIT */}
        <div className="flex justify-end gap-4 pb-12">
          <Button variant="outline" type="button" onClick={() => navigate('/dashboard')}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting} leftIcon={<Building size={18} />}>
            Launch Project
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddProperty;

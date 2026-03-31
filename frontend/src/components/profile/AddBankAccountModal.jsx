import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { userService } from '../../services/userService';
import { Landmark, Fingerprint, User } from 'lucide-react';

const AddBankAccountModal = ({ isOpen, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    account_number: '',
    ifsc_code: '',
    account_holder_name: '',
    is_primary: false
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await userService.addBankAccount(formData);
      onSuccess();
      onClose();
      // Reset form
      setFormData({
        account_number: '',
        ifsc_code: '',
        account_holder_name: '',
        is_primary: false
      });
    } catch (error) {
      console.error("Failed to add bank account", error);
      alert("Failed to add bank account. Please check your details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Link Bank Account">
      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          label="Account Holder Name"
          name="account_holder_name"
          placeholder="As per bank records"
          icon={User}
          value={formData.account_holder_name}
          onChange={handleChange}
          required
        />
        <Input
          label="Account Number"
          name="account_number"
          placeholder="Enter 12-16 digit number"
          icon={Fingerprint}
          value={formData.account_number}
          onChange={handleChange}
          required
        />
        <Input
          label="IFSC Code"
          name="ifsc_code"
          placeholder="e.g. HDFC0001234"
          icon={Landmark}
          value={formData.ifsc_code}
          onChange={handleChange}
          required
        />
        
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="is_primary"
            name="is_primary"
            className="rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
            checked={formData.is_primary}
            onChange={handleChange}
          />
          <label htmlFor="is_primary" className="text-sm font-medium text-secondary-700 dark:text-secondary-300">
            Set as primary bank account
          </label>
        </div>

        <Button type="submit" className="w-full h-12" isLoading={loading}>
          Add Bank Account
        </Button>
      </form>
    </Modal>
  );
};

export default AddBankAccountModal;

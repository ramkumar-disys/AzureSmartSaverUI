import React, { useState } from 'react';
import './Page.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import * as Yup from 'yup';

const Page = () => {
  const navigate = useNavigate();
  const [subscriptionID, setSubscriptionID] = useState('');
  const [resourceGroup, setResourceGroup] = useState('');
  const [tenantID, setTenantID] = useState('');
  const [clientID, setClientID] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [responseData, setResponseData] = useState(null);

  const [subscriptionIDError, setSubscriptionIDError] = useState('');
  const [resourceGroupError, setResourceGroupError] = useState('');
  const [tenantIDError, setTenantIDError] = useState('');
  const [clientIDError, setClientIDError] = useState('');
  const [clientSecretError, setClientSecretError] = useState('');

  const validationSchema = Yup.object().shape({
    subscriptionID: Yup.string().required('*Subscription ID is required'),
    resourceGroup: Yup.string().required('*Resource Group is required'),
    tenantID: Yup.string().required('*Tenant ID is required'),
    clientID: Yup.string().required('*Client ID is required'),
    clientSecret: Yup.string().required('*Client Secret is required'),
  });

  const handleSubscriptionIDChange = (e) => {
    setSubscriptionID(e.target.value);
    setSubscriptionIDError('');
  };

  const handleResourceGroupChange = (e) => {
    setResourceGroup(e.target.value);
    setResourceGroupError('');
  };

  const handleTenantIDChange = (e) => {
    setTenantID(e.target.value);
    setTenantIDError('');
  };

  const handleClientIDChange = (e) => {
    setClientID(e.target.value);
    setClientIDError('');
  };

  const handleClientSecretChange = (e) => {
    setClientSecret(e.target.value);
    setClientSecretError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await validationSchema.validate({
        subscriptionID,
        resourceGroup,
        tenantID,
        clientID,
        clientSecret,
      }, { abortEarly: false });

      try {
        const response = await axios.post('https://azuresmartsaverapi.azurewebsites.net/api/SQLMetrics/Cost_Recommedations', {
          subscriptionID,
          resourceGroup,
          tenantID,
          clientID,
          clientSecret,
        });

        console.log('Data Fetched:', response.data);
        setResponseData(response.data);
        setErrorMessage('');

        navigate('/response', { state: { responseData: response.data } });
      } catch (error) {
        console.error('Registration failed:', error.message);
        setErrorMessage('Registration failed. Please try again.');
        setSuccessMessage('');
      }
    } catch (error) {
      error.inner.forEach(err => {
        switch (err.path) {
          case 'subscriptionID':
            setSubscriptionIDError(err.message);
            break;
          case 'resourceGroup':
            setResourceGroupError(err.message);
            break;
          case 'tenantID':
            setTenantIDError(err.message);
            break;
          case 'clientID':
            setClientIDError(err.message);
            break;
          case 'clientSecret':
            setClientSecretError(err.message);
            break;
          default:
            break;
        }
      });
    }
  };

  return (
    <div className='register-container'>
      <div className='reg-user'>
        <form onSubmit={handleSubmit}>
          <div className='form-group'>
            <label htmlFor='subscriptionID'>Subscription ID</label>
            <input
              type='text'
              id='subscriptionID'
              value={subscriptionID}
              onChange={handleSubscriptionIDChange}
            />
            {subscriptionIDError && <p style={{ color: 'red', margin: 'auto' }}>{subscriptionIDError}</p>}
          </div>

          <div className='form-group'>
            <label htmlFor='resourceGroup'>Resource Group</label>
            <input
              type='text'
              id='resourceGroup'
              value={resourceGroup}
              onChange={handleResourceGroupChange}
            />
            {resourceGroupError && <p style={{ color: 'red', margin: 'auto' }}>{resourceGroupError}</p>}
          </div>

          <div className='form-group'>
            <label htmlFor='tenantID'>Tenant ID</label>
            <input
              type='text'
              id='tenantID'
              value={tenantID}
              onChange={handleTenantIDChange}
            />
            {tenantIDError && <p style={{ color: 'red', margin: 'auto' }}>{tenantIDError}</p>}
          </div>

          <div className='form-group'>
            <label htmlFor='clientID'>Client ID</label>
            <input
              type='text'
              id='clientID'
              value={clientID}
              onChange={handleClientIDChange}
            />
            {clientIDError && <p style={{ color: 'red', margin: 'auto' }}>{clientIDError}</p>}
          </div>

          <div className='form-group'>
            <label htmlFor='clientSecret'>Client Secret</label>
            <input
              type='text'
              id='clientSecret'
              value={clientSecret}
              onChange={handleClientSecretChange}
            />
            {clientSecretError && <p style={{ color: 'red', margin: 'auto' }}>{clientSecretError}</p>}
          </div>

          <button type='submit' className='submit-btn'>Submit</button>
        </form>

        {errorMessage && <p className='error-message'>{errorMessage}</p>}
      </div>

    </div>
  );
};

export default Page;
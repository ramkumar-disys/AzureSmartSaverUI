import React, { useState } from 'react';
import './Model.css';

function Modal({ isOpen, onClose, fetchCloudOpsItems }) {
    const [tenantID, setTenantID] = useState('');
    const [clientID, setClientID] = useState('');
    const [clientSecret, setClientSecret] = useState('');
    const [subscriptionID, setSubscriptionID] = useState('');
    const [resourceGroup, setResourceGroup] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        const requestData = {
            id: 0,  // ID is zero as per the requirement
            tenantID: tenantID,
            clientID: clientID,
            clientSecret: clientSecret,
            subscriptionID: subscriptionID,
            resourceGroup: resourceGroup
        };

        try {
            const response = await fetch('https://azuresmartsaverapi.azurewebsites.net/api/Main/SaveCloudOnboardingDetails', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': '*/*'
                },
                body: JSON.stringify(requestData)
            });

            if (response.ok) {
                console.log("Cloud onboarding details saved successfully.");
                onClose();  // Close the modal
                fetchCloudOpsItems();  // Refresh the cloud ops items
            } else {
                console.error("Failed to save cloud onboarding details:", response.status);
            }
        } catch (error) {
            console.error("Error:", error);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-container">
                <button className="modal-close" onClick={onClose}>×</button>
                <h2>Cloud Onboarding</h2>
                <form onSubmit={handleSubmit}>
                    <label>Tenant ID</label>
                    <input type="text" value={tenantID} onChange={(e) => setTenantID(e.target.value)} required />

                    <label>Client ID</label>
                    <input type="text" value={clientID} onChange={(e) => setClientID(e.target.value)} required />

                    <label>Client Secret</label>
                    <input type="password" value={clientSecret} onChange={(e) => setClientSecret(e.target.value)} required />

                    <label>Subscription ID</label>
                    <input type="text" value={subscriptionID} onChange={(e) => setSubscriptionID(e.target.value)} required />

                    <label>Resource Group</label>
                    <input type="text" value={resourceGroup} onChange={(e) => setResourceGroup(e.target.value)} required />

                    <button type="submit" className="submit-button">OnBoard ResourceGroup</button>
                </form>
            </div>
        </div>
    );
}

export default Modal;

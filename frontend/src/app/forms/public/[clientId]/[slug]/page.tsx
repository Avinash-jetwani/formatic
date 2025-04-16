// src/app/forms/public/[clientId]/[slug]/page.tsx file

const handleSubmit = async (e: FormEvent) => {
  e.preventDefault();
  setSubmitting(true);
  setError('');

  try {
    // Validate required fields
    const missingRequired = form.fields
      .filter((field: any) => field.required)
      .filter((field: any) => {
        if (field.type === 'CHECKBOX') {
          return !formValues[field.label] || formValues[field.label].length === 0;
        }
        return !formValues[field.label];
      });

    if (missingRequired.length > 0) {
      setError(`Please fill out all required fields: ${missingRequired.map((f: any) => f.label).join(', ')}`);
      setSubmitting(false);
      return;
    }

    const submissionData = {
      formId: form.id,
      data: formValues,
    };

    const { data, error } = await submissionsService.createSubmission(submissionData);
    
    if (data && !error) {
      setSubmitted(true);
      // Reset form
      const initialValues: Record<string, any> = {};
      form.fields.forEach((field: any) => {
        if (field.type === 'CHECKBOX') {
          initialValues[field.label] = [];
        } else {
          initialValues[field.label] = '';
        }
      });
      setFormValues(initialValues);
    } else {
      setError(error || 'Failed to submit form');
    }
  } catch (err) {
    setError('An error occurred. Please try again.');
  } finally {
    setSubmitting(false);
  }
};

if (loading) {
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );
}

if (error) {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-red-500">
            <h2 className="text-xl font-semibold mb-2">Error</h2>
            <p>{error}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

if (!form) {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Form Not Found</h2>
            <p>The form you're looking for doesn't exist or has been removed.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

if (!form.published) {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Form Not Available</h2>
            <p>This form is currently not published.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

if (submitted) {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2 text-green-600">Form Submitted Successfully!</h2>
            <p className="mb-4">Thank you for your submission.</p>
            <button
              onClick={() => setSubmitted(false)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
            >
              Submit Another Response
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

return (
  <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div className="max-w-2xl mx-auto">
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">{form.title}</h1>
          {form.description && <p className="text-gray-600">{form.description}</p>}
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 p-3 rounded-md">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {form.fields && form.fields.length > 0 ? (
            <div className="space-y-6">
              {form.fields
                .sort((a: any, b: any) => a.order - b.order)
                .map((field: any) => (
                  <div key={field.id} className="space-y-2">
                    <label className="block font-medium text-gray-700">
                      {field.label}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                    </label>

                    {/* Text input */}
                    {field.type === 'TEXT' && (
                      <input
                        type="text"
                        name={field.label}
                        value={formValues[field.label] || ''}
                        onChange={handleInputChange}
                        placeholder={field.placeholder || ''}
                        required={field.required}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    )}

                    {/* Dropdown */}
                    {field.type === 'DROPDOWN' && (
                      <select
                        name={field.label}
                        value={formValues[field.label] || ''}
                        onChange={handleInputChange}
                        required={field.required}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select an option</option>
                        {field.options.map((option: string, index: number) => (
                          <option key={index} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    )}

                    {/* Checkbox */}
                    {field.type === 'CHECKBOX' && (
                      <div className="space-y-2">
                        {field.options.map((option: string, index: number) => (
                          <div key={index} className="flex items-center">
                            <input
                              type="checkbox"
                              name={field.label}
                              value={option}
                              checked={(formValues[field.label] || []).includes(option)}
                              onChange={handleInputChange}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label className="ml-2 text-gray-700">{option}</label>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Radio */}
                    {field.type === 'RADIO' && (
                      <div className="space-y-2">
                        {field.options.map((option: string, index: number) => (
                          <div key={index} className="flex items-center">
                            <input
                              type="radio"
                              name={field.label}
                              value={option}
                              checked={formValues[field.label] === option}
                              onChange={handleInputChange}
                              required={field.required}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                            />
                            <label className="ml-2 text-gray-700">{option}</label>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* File upload (placeholder for now) */}
                    {field.type === 'FILE' && (
                      <div>
                        <input
                          type="file"
                          name={field.label}
                          required={field.required}
                          className="w-full"
                          // Note: File handling to be implemented in future
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          File upload functionality will be implemented in a future update.
                        </p>
                      </div>
                    )}
                  </div>
                ))}

              <div className="mt-8">
                <button
                  type="submit"
                  disabled={submitting}
                  className={`w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md ${
                    submitting ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  {submitting ? 'Submitting...' : 'Submit'}
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>This form has no fields.</p>
            </div>
          )}
        </form>
      </div>
    </div>
  </div>
);
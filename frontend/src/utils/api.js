/**
 * Fetch open exchange opportunities from public REST endpoints
 * @param {Object} queryParams
 * @param {number} queryParams.page - Page index
 * @param {number} queryParams.limit - Cards limit per page
 * @param {string} queryParams.programType - Filter category ('GTa' or 'GV' or '')
 * @returns {Promise<Object>} API JSON response containing opportunities and pagination metadata
 */
export const fetchOpportunities = async ({ page = 1, limit = 6, programType = '' } = {}) => {
  try {
    const params = new URLSearchParams();
    params.append('page', page);
    params.append('limit', limit);
    if (programType) {
      params.append('programType', programType);
    }

    const response = await fetch(`/api/opportunities?${params.toString()}`);
    if (!response.ok) {
      throw new Error(`Error: ${response.status} ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('❌ API Error fetching opportunities list:', error);
    throw error;
  }
};

/**
 * Fetch a single opportunity full details
 * @param {string} id - Mongoose Opportunity ObjectID
 * @returns {Promise<Object>} The opportunity details object
 */
export const fetchOpportunityById = async (id) => {
  try {
    const response = await fetch(`/api/opportunities/${id}`);
    if (!response.ok) {
      throw new Error(`Error: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    return data.opportunity;
  } catch (error) {
    console.error(`❌ API Error fetching opportunity ID ${id}:`, error);
    throw error;
  }
};

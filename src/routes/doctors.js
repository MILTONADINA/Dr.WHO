/**
 * Routes for Doctor operations
 * Clean, validated, and properly handled
 */

const express = require('express');
const router = express.Router();
const doctorService = require('../services/doctorService');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, sendCreated, sendUpdated, sendDeleted } = require('../utils/responseHandler');
const { validateId, validateDoctorData } = require('../middleware/validation');

/**
 * GET /api/doctors - Get all doctors
 */
router.get('/', asyncHandler(async (req, res) => {
  const doctors = await doctorService.getAllDoctors();
  sendSuccess(res, doctors);
}));

/**
 * GET /api/doctors/:id - Get doctor by ID
 */
router.get('/:id', validateId(), asyncHandler(async (req, res) => {
  const doctor = await doctorService.getDoctorById(req.params.id);
  sendSuccess(res, doctor);
}));

/**
 * POST /api/doctors - Create new doctor
 */
router.post('/', validateDoctorData, asyncHandler(async (req, res) => {
  const doctor = await doctorService.createDoctor(req.body);
  sendCreated(res, doctor);
}));

/**
 * PUT /api/doctors/:id - Update doctor
 */
router.put('/:id', validateId(), validateDoctorData, asyncHandler(async (req, res) => {
  const doctor = await doctorService.updateDoctor(req.params.id, req.body);
  sendUpdated(res, doctor);
}));

/**
 * DELETE /api/doctors/:id - Delete doctor
 */
router.delete('/:id', validateId(), asyncHandler(async (req, res) => {
  await doctorService.deleteDoctor(req.params.id);
  sendDeleted(res);
}));

module.exports = router;
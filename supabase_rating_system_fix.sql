-- Fix Rating & Review System
-- This script creates a trigger to automatically update rating aggregates in the profiles table

-- Function to update rating aggregates
CREATE OR REPLACE FUNCTION update_profile_rating()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the accountant's profile with new rating stats
  UPDATE profiles
  SET 
    rating_avg = (
      SELECT COALESCE(AVG(rating), 0)
      FROM reviews
      WHERE accountant_id = COALESCE(NEW.accountant_id, OLD.accountant_id)
    ),
    reviews_count = (
      SELECT COUNT(*)
      FROM reviews
      WHERE accountant_id = COALESCE(NEW.accountant_id, OLD.accountant_id)
    )
  WHERE id = COALESCE(NEW.accountant_id, OLD.accountant_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS trigger_update_profile_rating ON reviews;

-- Create trigger that fires after INSERT, UPDATE, or DELETE on reviews
CREATE TRIGGER trigger_update_profile_rating
AFTER INSERT OR UPDATE OR DELETE ON reviews
FOR EACH ROW
EXECUTE FUNCTION update_profile_rating();

-- Recalculate all existing ratings to ensure data consistency
UPDATE profiles p
SET 
  rating_avg = (
    SELECT COALESCE(AVG(rating), 0)
    FROM reviews r
    WHERE r.accountant_id = p.id
  ),
  reviews_count = (
    SELECT COUNT(*)
    FROM reviews r
    WHERE r.accountant_id = p.id
  )
WHERE p.role = 'accountant';

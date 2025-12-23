-- This migration fixes RLS policies for orders and order_items tables
-- It should be run AFTER the tables are created (after migration 20251222124337)

-- Only proceed if the orders table exists
DO $$
BEGIN
  -- Check if orders table exists
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'orders') THEN
    
    -- Drop existing policies for orders if they exist
    DROP POLICY IF EXISTS "Anyone can create orders" ON public.orders;
    DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;
    DROP POLICY IF EXISTS "Admins can update orders" ON public.orders;

    -- Recreate policies with explicit permissions for anonymous and authenticated users
    -- Allow anyone (including anonymous users) to create orders
    CREATE POLICY "Anyone can create orders" 
    ON public.orders 
    FOR INSERT 
    TO anon, authenticated
    WITH CHECK (true);

    -- Allow admins to view all orders
    CREATE POLICY "Admins can view all orders" 
    ON public.orders 
    FOR SELECT 
    TO authenticated
    USING (public.has_role(auth.uid(), 'admin'));

    -- Allow admins to update orders
    CREATE POLICY "Admins can update orders" 
    ON public.orders 
    FOR UPDATE 
    TO authenticated
    USING (public.has_role(auth.uid(), 'admin'));

  END IF;

  -- Check if order_items table exists
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'order_items') THEN
    
    -- Drop and recreate order_items policies
    DROP POLICY IF EXISTS "Anyone can create order items" ON public.order_items;
    DROP POLICY IF EXISTS "Admins can view all order items" ON public.order_items;

    -- Allow anyone (including anonymous users) to create order items
    CREATE POLICY "Anyone can create order items" 
    ON public.order_items 
    FOR INSERT 
    TO anon, authenticated
    WITH CHECK (true);

    -- Allow admins to view all order items
    CREATE POLICY "Admins can view all order items" 
    ON public.order_items 
    FOR SELECT 
    TO authenticated
    USING (public.has_role(auth.uid(), 'admin'));

  END IF;
END $$;


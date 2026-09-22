-- ============================================================
-- Seed data: small demo family tree for local development
-- and the public landing page demo.
--
-- Covers: 3 generations, 1 union node, 1 adoption, 1 deceased.
-- Keep in sync with schema as it evolves.
-- ============================================================

-- Demo tree
INSERT INTO trees (id, name, creator_id, privacy)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'The Hartwell Family',
  '00000000-0000-0000-0000-000000000099',  -- placeholder creator (no auth in seed)
  'public'
);

-- Generation 1: Grandparents
INSERT INTO persons (id, tree_id, first_name, last_name, birth_date, birth_location, death_date, is_living, generation_index, canvas_x, canvas_y, path)
VALUES
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001',
   'George', 'Hartwell', '1930-04-12', 'London, UK', '2005-11-03', false, 0, 100, 100,
   '00000000000000000000000000000001.00000000000000000000000000000000.10000000000000000000000000000001'),

  ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001',
   'Margaret', 'Hartwell', '1933-08-22', 'Edinburgh, UK', NULL, false, 0, 350, 100,
   '00000000000000000000000000000001.00000000000000000000000000000000.10000000000000000000000000000002');

-- Union node: George + Margaret
INSERT INTO union_nodes (id, tree_id, partner_1_id, partner_2_id, relationship_type, canvas_x, canvas_y, path)
VALUES (
  '20000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000001',
  '10000000-0000-0000-0000-000000000001',
  '10000000-0000-0000-0000-000000000002',
  'married',
  225, 100,
  '00000000000000000000000000000001.20000000000000000000000000000001'
);

-- Generation 2: Children of George + Margaret
INSERT INTO persons (id, tree_id, first_name, last_name, birth_date, birth_location, is_living, generation_index, canvas_x, canvas_y, path)
VALUES
  ('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001',
   'James', 'Hartwell', '1958-02-14', 'London, UK', true, 1, 100, 250,
   '00000000000000000000000000000001.20000000000000000000000000000001.10000000000000000000000000000003'),

  ('10000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001',
   'Patricia', 'Hartwell', '1961-09-30', 'London, UK', true, 1, 350, 250,
   '00000000000000000000000000000001.20000000000000000000000000000001.10000000000000000000000000000004');

-- Edges: George+Margaret → James (biological), George+Margaret → Patricia (biological)
INSERT INTO edges (union_node_id, child_person_id, edge_type)
VALUES
  ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000003', 'biological'),
  ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000004', 'biological');

-- Generation 3: James's partner + children
INSERT INTO persons (id, tree_id, first_name, last_name, birth_date, birth_location, is_living, generation_index, canvas_x, canvas_y, path)
VALUES
  ('10000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001',
   'Claire', 'Bennett', '1960-05-17', 'Manchester, UK', true, 1, 100, 400,
   '00000000000000000000000000000001.00000000000000000000000000000000.10000000000000000000000000000005'),

  ('10000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000001',
   'Oliver', 'Hartwell', '1985-12-01', 'London, UK', true, 2, 50, 550,
   '00000000000000000000000000000001.20000000000000000000000000000002.10000000000000000000000000000006'),

  ('10000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000001',
   'Sophie', 'Hartwell', '1988-03-15', 'London, UK', true, 2, 200, 550,
   '00000000000000000000000000000001.20000000000000000000000000000002.10000000000000000000000000000007'),

  -- Adopted child — edge_type demonstrates adoption support
  ('10000000-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000001',
   'Aiden', 'Hartwell', '1992-07-09', 'Dublin, Ireland', true, 2, 350, 550,
   '00000000000000000000000000000001.20000000000000000000000000000002.10000000000000000000000000000008');

-- Union node: James + Claire
INSERT INTO union_nodes (id, tree_id, partner_1_id, partner_2_id, relationship_type, canvas_x, canvas_y, path)
VALUES (
  '20000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000001',
  '10000000-0000-0000-0000-000000000003',
  '10000000-0000-0000-0000-000000000005',
  'married',
  200, 400,
  '00000000000000000000000000000001.20000000000000000000000000000002'
);

-- Edges: James+Claire → Oliver, Sophie (biological), Aiden (adopted)
INSERT INTO edges (union_node_id, child_person_id, edge_type)
VALUES
  ('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000006', 'biological'),
  ('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000007', 'biological'),
  ('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000008', 'adopted');

<?php

namespace lx\tools\module\tableToTable\backend;

class Resp extends \lx\Respondent {
	private
		$table0,
		$table1;

	public function __construct($module) {
		parent::__construct($module);

		$this->table0 = $module->params->table0;
		$this->table1 = $module->params->table1;
		$this->tableBond = "{$this->table0}_{$this->table1}";
	}

	/**
	 * Все данные по обеим таблицам и по связывающей их таблице
	 * */
	public function getInfo() {
		return [
			$this->db->tableSchema($this->table0, \lx\DB::SHORT_SCHEMA),
			$this->db->tableSchema($this->table1, \lx\DB::SHORT_SCHEMA),

			$this->getTable0(),
			$this->getTable1(),
			$this->getBond(),
		];
	}

	/**
	 * Все данные по первой таблице
	 * */
	public function getTable0() {
		$res = $this->db->select("SELECT * FROM {$this->table0}");
		return $res;
	}

	/**
	 * Все данные по второй таблице
	 * */
	public function getTable1() {
		$res = $this->db->select("SELECT * FROM {$this->table1}");
		return $res;
	}

	/**
	 * Все данные по связывающей таблице
	 * */
	public function getBond() {
		$db = $this->db;
		$tableName = $this->tableBond;

		if (!$db->tableExists($tableName)) {
			$res = $db->newTable($tableName, [
				"id_{$this->table0}" => $db->integer(),
				"id_{$this->table1}" => $db->integer()
			]);
		}

		$res = $db->select("SELECT id_{$this->table0} as id0, id_{$this->table1} as id1 FROM $tableName");
		return $res;		
	}

	/**
	 * Создает связь в связывающей таблице
	 * */
	public function addBond($idTable0, $idTable1) {
		$db = $this->db;
		$res = $db->select("SELECT * FROM {$this->tableBond} WHERE id_{$this->table0}=$idTable0 AND id_{$this->table1}=$idTable1");
		if (!empty($res)) return false;

		$db->table($this->tableBond)->insert(["id_{$this->table0}", "id_{$this->table1}"], [
			[$idTable0, $idTable1]
		], false);
	}

	/**
	 * Удаляет связь из связывающей таблицы
	 * */
	public function delBond($idTable0, $idTable1) {
		$db = $this->db;
		$res = $db->select("SELECT * FROM {$this->tableBond} WHERE id_{$this->table0}=$idTable0 AND id_{$this->table1}=$idTable1");
		if (empty($res)) return false;

		$db->query("DELETE FROM {$this->tableBond} WHERE id_{$this->table0}=$idTable0 AND id_{$this->table1}=$idTable1");
	}

	/**
	 * Добавить новую запись в первой таблице
	 * */
	public function addTable0() {
		$id = $this->db
		->table($this->table0)
		->insert(
			['name', 'width'], [
				['', 0]
			]);
		return $id;
	}

	/**
	 * Добавить новую запись во второй таблице
	 * */
	public function addTable1() {
		$id = $this->db
		->table($this->table1)
		->insert(
			['name', 'image'], [
				['', '']
			]);
		return $id;
	}

	/**
	 * Удаление из первой таблицы
	 * */
	public function delTable0($id) {
		$db = $this->db;
		$db->query("DELETE FROM {$this->tableBond} WHERE id_{$this->table0}=$id");
		$db->query("DELETE FROM {$this->table0} WHERE id=$id");
	}

	/**
	 * Удаление из второй таблицы
	 * */
	public function delTable1($id) {
		$db = $this->db;
		$db->query("DELETE FROM {$this->tableBond} WHERE id_{$this->table1}=$id");
		$db->query("DELETE FROM {$this->table1} WHERE id=$id");
	}

	/**
	 * Изменение значения поля для записи из первой таблицы
	 * */
	public function updateTable0($id, $field, $value) {
		$this->db
		->table($this->table0)
		->update([
			$field => $value
		], "id = $id");
	}

	/**
	 * Изменение значения поля для записи из второй таблицы
	 * */
	public function updateTable1($id, $field, $value) {
		$this->db
		->table($this->table1)
		->update([
			$field => $value
		], "id = $id");
	}
}
